import axios from 'axios';
import { Logger, HttpException, HttpStatus } from '@nestjs/common';
import 'dotenv/config';

export class MelhorEnvioApi {
    private readonly logger = new Logger(MelhorEnvioApi.name);

    async calcularFretePorCep(cep: string): Promise<any> {
        this.logger.log(`Calculando frete para o CEP: ${cep}`);

        if (!/^\d{8}$/.test(cep)) {
            this.logger.error(`Formato de CEP inválido: ${cep}`);
            throw new HttpException('Formato de CEP inválido!', HttpStatus.BAD_REQUEST);
        }
        if (!process.env.PsycalStore) {
          console.error('Token MelhorEnvio não configurado no ambiente.');
          throw new Error('Token MelhorEnvio não configurado!');
      } else {
          console.log('Token carregado:', process.env.PsycalStore);
      }
      

        const payload = {
            'from': {
                postal_code: '01001000', 
            },
            'to': {
                postal_code: "52110440", 
            },
           'products': [
                {
                    id: '1',
                    width: 15,
                    height: 10,
                    length: 20,
                    weight: 1,
                    insurance_value: 0,
                    quantity: 1,
                },
            ],
            'options': {
                receipt: false,
                own_hand: false,
                insurance_value: 0,
                reverse: false,
                non_commercial: true,
            },
            'services': [
              "1",
              "2"
            ], 
            'validate': true,
        };

        this.logger.log('Payload montado:', payload);

        try {

          
    

            const response = await axios.post(
                'https://melhorenvio.com.br/api/v2/me/shipment/calculate',
                payload,
                {
                
                    headers: {
                        Authorization: `Bearer ${process.env.PsycalStore}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );

            this.logger.log(`Resposta completa da API Melhor Envio: ${JSON.stringify(response.data)}`);


            if (typeof response.data === 'string' && response.data.includes('<html>')) {
              this.logger.error('Recebeu HTML ao invés de JSON na resposta da API Melhor Envio.');
              throw new HttpException('Resposta inesperada da API Melhor Envio. Possível problema de autenticação ou configuração.', HttpStatus.INTERNAL_SERVER_ERROR);
          }
          
          const resultado = Array.isArray(response.data)
    ? response.data.map((service: any) => ({
        prazo: service.delivery_time ? `${service.delivery_time} dias úteis` : 'Não informado',
        codProdutoAgencia: service.agency_service_code || 'Não informado',
        price: service.price ? `R$ ${parseFloat(service.price).toFixed(2)}` : 'Não informado',
        description: service.description || 'Não informado',
    }))
    : [
        {
            prazo: response.data.delivery_time ? `${response.data.delivery_time} dias úteis` : 'Não informado',
            codProdutoAgencia: response.data.agency_service_code || 'Não informado',
            price: response.data.price ? `R$ ${parseFloat(response.data.price).toFixed(2)}` : 'Não informado',
            description: response.data.description || 'Não informado',
        }
    ];
            this.logger.log(`Resultado obtido: ${JSON.stringify(resultado)}`);
            return resultado;
        } catch (error: any) {
            this.logger.error(`Erro na chamada à API Melhor Envio: ${error.message}`);
            this.logger.error(`Detalhes: ${JSON.stringify(error.response?.data || error.response || error)}`);
            throw new HttpException('Erro na chamada à API Melhor Envio.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}
