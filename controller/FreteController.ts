import { Controller, Get, Param, HttpException, HttpStatus,Logger,Post,Body } from '@nestjs/common';
import { MelhorEnvioApi } from '../Service/calculateFreteWithMelhorEnvio';
import { ViaCepService } from '../Service/GetCep-service';
import { LocationService } from '../Service/LocationService';
import { LojaService } from '../Service/lojasService';

@Controller('frete')
export class FreteController {
    private readonly logger = new Logger (FreteController.name)
    constructor(
      private readonly lojaService: LojaService,
      private readonly  ViaCepService: ViaCepService,
      private readonly LocationService:LocationService,
      private readonly MelhorEnvioApi: MelhorEnvioApi,

    ) {}
    @Post()
    async calcularFrete(@Body() payload: { to: { postal_code: string } }): Promise<any> {
      const cep = payload?.to?.postal_code;
      const formattedCep = cep?.replace('-', '');
      this.logger.log(`Recebendo requisição para cálculo de frete com o CEP: ${formattedCep}`);
      try{
      if (!formattedCep || !/^\d{8}$/.test(formattedCep)) {
        throw new HttpException('O campo "to.postal_code" deve ser um CEP válido no formato 8 dígitos!', HttpStatus.BAD_REQUEST);
    }

    const location = await this.ViaCepService.getViaCep(formattedCep);
    if (!location) {
        throw new HttpException('Não foi possível determinar as coordenadas para o CEP informado.', HttpStatus.BAD_REQUEST);
    }

    const { lat, lon } = location;

    const storesWithinRadius = await this.LocationService.getStoresWithinRadius(lat, lon, 100);
    if (storesWithinRadius.length === 0) {
        throw new HttpException('Nenhuma loja encontrada próxima ao local informado.', HttpStatus.NOT_FOUND);
    }

    const nearestStore = storesWithinRadius[0]; 
    const resultado = await this.MelhorEnvioApi.calcularFretePorCep(formattedCep);

    return {
        storeInfo: {
            name: nearestStore.name,
            city: nearestStore.city,
            postalCode: nearestStore.cep,
            distance: `${(nearestStore.distance / 1000).toFixed(1)} km`, 
        },
        freteOptions: resultado,
    };
        } catch (error: any) {
            this.logger.error(`Erro ao buscar frete: ${error.message}`);
            throw new HttpException(
                error.message || 'Erro interno ao calcular frete.',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    
    @Get('storeByCep/:cep')
    async storeAndFreight(@Param('cep') cep: string): Promise<any> {
        this.logger.log(`Buscando loja próxima ao CEP ${cep} e calculando frete.`);
    
        type DeliveryOption = {
            prazo: string;
            price: number;
            description: string;
        };
        try {
           
            const sanitizedCep = cep.replace(/\D/g, '');
            if (!/^\d{8}$/.test(sanitizedCep)) {
                throw new HttpException('O CEP deve conter exatamente 8 dígitos.', HttpStatus.BAD_REQUEST);
            }
    
           
            const coordinates = await this.ViaCepService.getViaCep(sanitizedCep);
            if (!coordinates || !coordinates.lat || !coordinates.lon) {
                this.logger.warn(`Coordenadas não encontradas para o CEP ${sanitizedCep}.`);
                throw new HttpException('Não foi possível obter coordenadas para o CEP informado.', HttpStatus.NOT_FOUND);
            }
    
            const { lat, lon } = coordinates;
    
            const radiusInKm = 50;
            const nearbyStores = await this.LocationService.getStoresWithinRadius(lat, lon, radiusInKm);
            if (!nearbyStores || nearbyStores.length === 0) {
                this.logger.warn(`Nenhuma loja encontrada dentro do raio de ${radiusInKm} km.`);
                throw new HttpException('Nenhuma loja encontrada dentro do raio especificado.', HttpStatus.NOT_FOUND);
            }
           
          const formattedStores = nearbyStores.map((store) => ({
            storeID: store._id,
            storeName: store.name,
            type: store.type || 'PDV', 
            latitude: store.latitude.toString(),
            longitude: store.longitude.toString(),
            address1: store.logradouro,
            address3: store.bairro,
            city: store.city,
            state: store.estado,
            postalCode: store.cep,
        }));
          
        const pins = nearbyStores.map(store => ({
            latitude: store.latitude,
            longitude: store.longitude,
            label: store.name,
        }));


        const limit = 1;
        const offset = 1;
        const total = nearbyStores.length;
       
             
        const melhorEnvioApi = new MelhorEnvioApi();
        const deliveryOptions = await melhorEnvioApi.calcularFretePorCep(sanitizedCep);

        const selectedDeliveryOption = deliveryOptions.length > 0 
            ? deliveryOptions.sort((a: any, b: any) => a.distance - b.distance)[0] 
            : null;

        +
        + console.log('Selected Delivery Option:', selectedDeliveryOption);

        return {
            stores: formattedStores,
            pins,
           deliveryOption: selectedDeliveryOption, 
            limit,
            offset,
            total,
        };

        return { stores: formattedStores };
        } catch (error: any) {
            this.logger.error(`Erro ao buscar loja e calcular frete: ${error.message}`);
            throw new HttpException(
                error.message || 'Erro ao processar a solicitação.',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    
    @Get('storeById/:id')
async storeById(@Param('id') id: string): Promise<any> {
    this.logger.log(`Buscando loja específica pelo ID: ${id}`);

    try {
      
        const store = await this.lojaService.getStoreById(id);

        
        if (!store) {
            throw new HttpException('Loja não encontrada.', HttpStatus.NOT_FOUND);
        }

        
        const formattedStore = {
            storeID: store._id,
            storeName: store.name,
            type: store.type || 'PDV', 
            latitude: store.latitude.toString(),
            longitude: store.longitude.toString(),
            address1: store.logradouro,
            address3: store.bairro,
            city: store.city,
            state: store.estado,
            postalCode: store.cep,
        };

     
        const response = {
            stores: [formattedStore], 
            limit: 1, 
            offset: 1, 
            total: 1, 
        };

        return response;
    } catch (error: any) {
        this.logger.error(`Erro ao buscar loja: ${error.message}`);
        throw new HttpException(
            error.message || 'Erro ao processar a solicitação.',
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}

@Get('storeByState/:state')
    async storeByState(@Param('state') state: string): Promise<any> {
        this.logger.log(`Buscando lojas no estado: ${state}`);
    
        try {
           
            if (!/^[A-Z]{2}$/.test(state)) {
                throw new HttpException('O estado deve ser uma sigla com 2 letras!', HttpStatus.BAD_REQUEST);
            }
    
            const stores = await this.lojaService.getStoresByState(state);
    
          
            if (!stores || stores.length === 0) {
                throw new HttpException('Nenhuma loja encontrada no estado informado.', HttpStatus.NOT_FOUND);
            }
    
            
            const formattedStores = stores.map(store => ({
                storeID: store._id,
                storeName: store.name,
                type: store.type || 'PDV',
                latitude: store.latitude.toString(),
                longitude: store.longitude.toString(),
                address1: store.logradouro,
                address3: store.bairro,
                city: store.city,
                state: store.estado,
                postalCode: store.cep,
            }));
    
          
            const response = {
                stores: formattedStores,
                limit: formattedStores.length, 
                offset: 0, 
                total: formattedStores.length, 
            };
    
            return response;
        } catch (error: any) {
            this.logger.error(`Erro ao buscar lojas: ${error.message}`);
            throw new HttpException(
                error.message || 'Erro ao processar a solicitação.',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

  }