import { Controller, Post, Body, HttpException, HttpStatus, Get, Logger, Param } from '@nestjs/common';
import { LojaService } from '../Service/lojasService';
import { CreateLojaDto } from '../data/createLoja';
import { LocationService } from '../Service/LocationService';
import { ViaCepService } from '../Service/GetCep-service';

@Controller('lojas')
export class LojaController {
    private readonly Logger = new Logger(LojaController.name);
    constructor(private readonly lojaService: LojaService,
        private readonly ViaCepService: ViaCepService,
        private readonly LocationService: LocationService
    ) {}

    @Post()
    async createLoja(@Body() body: CreateLojaDto) {
        try {
            const coordinates = await this.ViaCepService.getViaCep(body.cep);

            if (!coordinates) {
                throw new HttpException('CEP não encontrado ou inválido', HttpStatus.BAD_REQUEST);
            }
            const lojaComCoordenadas = {
                ...body,
                latitude: coordinates.lat,
                longitude: coordinates.lon,
            };
            
              const result = await this.lojaService.createLoja(lojaComCoordenadas);
              return result;
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
}
    @Get('listAll')
    async listAllStores(): Promise<any> {
        this.Logger.log('Buscando todas as lojas disponíveis na base.');

        try {

            const stores = await this.lojaService.getAllStores();
            const formattedStores = stores.map(store => ({
                storeID: store._id, 
                storeName: store.name,
                takeOutInStore: true, 
                shippingTimeInDays: 0, 
                latitude: store.latitude.toString(), 
                longitude: store.longitude.toString(), 
                address1: store.logradouro, 
                address3: store.bairro, 
                city: store.city, 
                district: store.bairro, 
                state: store.estado, 
                type: store.type, 
                country: 'Brasil', 
                postalCode: store.cep, 
                telephoneNumber: store.telephoneNumber || '',
                emailAddress: store.emailAddress || '',
            }));

            return { stores: formattedStores };
        } catch (error: any) {
            this.Logger.error(`Erro ao buscar lojas: ${error.message}`);
            throw new HttpException(
                'Erro ao processar a solicitação.',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    
    
}
