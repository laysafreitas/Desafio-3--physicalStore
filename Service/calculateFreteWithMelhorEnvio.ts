import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ViaCepService } from './GetCep-service';
import { InjectModel } from '@nestjs/mongoose';
import { ILoja } from '../data/Lojas';
import { Model } from 'mongoose';
import { LocationService } from './LocationService';
import axios from 'axios';


@Injectable()
export class calculateFreteWithMelhorEnvio {
    private readonly logger = new Logger(calculateFreteWithMelhorEnvio.name);
    constructor(
        private readonly viaCepService: ViaCepService,
        private readonly LocationService: LocationService,
           @InjectModel('Loja') private readonly lojaModel: Model<ILoja> 
      ) {}
      async calculateFrete(cep: string): Promise<any> {
        if (!/^\d{8}$/.test(cep)) {
            this.logger.error(`Formato de CEP inválido: ${cep}`);
            throw new HttpException('Formato de CEP inválido!', HttpStatus.BAD_REQUEST);
          }
          const clientCoordinates = await this.viaCepService.getViaCep(cep);


    if (!clientCoordinates) {
        this.logger.error(`Não foi possível obter as coordenadas do CEP: ${cep}`);
        throw new HttpException('CEP inválido ou não encontrado.', HttpStatus.BAD_REQUEST);
      }

      const { lat, lon } = clientCoordinates;

      const nearestStores = await this.LocationService.getStoresWithinRadius(lat, lon, 50);
      const nearestStore = nearestStores[0];

      if (!nearestStore) {
        this.logger.error('Nenhuma loja encontrada próxima ao cliente.');
        throw new HttpException('Nenhuma loja encontrada próxima ao cliente.', HttpStatus.NOT_FOUND);
      }

      this.logger.log(`Loja mais próxima encontrada: ${nearestStore.name}, CEP: ${nearestStore.cep}`);

      const storeInfo = await this.lojaModel.findOne({ cep: nearestStore.cep });
      if (!storeInfo) {
        this.logger.error('Informações da loja não encontradas no banco de dados.');
        throw new HttpException('Erro ao obter informações da loja.', HttpStatus.NOT_FOUND);
      }
    
const payload={
    from: nearestStore.cep,
    to: cep,
    services: '41106,40010',
}
    this.logger.log('Payload montado para API Melhor Envio:', payload);
    try {
        const response = await axios.get(
            'https://www.melhorenvio.com.br/api/v1/shipping/calculate',
            {
              params: {
                from: nearestStore.cep,
                to: cep,
                services: '41106,40010',
              },
              headers: {
                Authorization: `Bearer ${process.env.MelhorEnvio}`,
                Accept: 'application/json',
              },
            }
          );
          this.logger.log(`Resposta da API: ${JSON.stringify(response.data)}`);

          
          const freteOptions = response.data.map((option: any) => ({
            prazo: option.deliveryTime,
            preco: option.price,
            descricao: option.description,
          }));
          this.logger.log(`Conteúdo de response.data: ${JSON.stringify(response.data)}`);

          this.logger.log(`Frete atualizado: ${JSON.stringify(freteOptions)}`);
          await this.lojaModel.updateOne(
            { cep: storeInfo.cep },
            { $set: { frete: freteOptions } }
          );

          const resultado = {
            loja: {
              name: storeInfo.name,
              cep: storeInfo.cep,
              city: storeInfo.city,
              bairro: storeInfo.bairro,
              logradouro: storeInfo.logradouro,
              estado: storeInfo.estado,
              ddd: storeInfo.ddd,
              latitude: storeInfo.latitude,
              longitude: storeInfo.longitude,
            },
            frete: storeInfo.frete, 
          };

          this.logger.log(`Resultado final: ${JSON.stringify(resultado)}`);
      return resultado;
         
      }catch(error:any){
        if (error.response) {
            this.logger.error(`Erro ao consultar a API: ${JSON.stringify(error.response.data)}`);
            throw new HttpException(
              error.response.data.message || 'Erro ao consultar a API Melhor Envio.',
              HttpStatus.INTERNAL_SERVER_ERROR
            );
        }else{
            this.logger.error(`Erro desconhecido: ${error.message}`);
            throw new HttpException('Erro interno.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    
      }
    }
}