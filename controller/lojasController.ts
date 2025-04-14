import { Controller, Post, Body, HttpException, HttpStatus, Get, Param } from '@nestjs/common';
import { LojaService } from '../Service/lojasService';
import { CreateLojaDto } from '../data/createLoja';
import { LocationService } from '../Service/LocationService';
import { ViaCepService } from '../Service/GetCep-service';

@Controller('lojas')
export class LojaController {
    constructor(private readonly lojaService: LojaService,
        private readonly locationService: LocationService,
        private readonly viaCepService: ViaCepService
    ) {}

    @Post()
    async createLoja(@Body() body: CreateLojaDto) {
        try {
            const coordinates = await this.viaCepService.getViaCep(body.cep);

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
@Get(':cep') 
async getNearbyStoresByCep(@Param('cep') cep: string): Promise<any[]> {
    if (!cep) {
        throw new HttpException('CEP é obrigatório!', HttpStatus.BAD_REQUEST);
    }


    const coordinates = await this.viaCepService.getViaCep(cep);

    if (!coordinates) {
        throw new HttpException('CEP não encontrado ou inválido!', HttpStatus.BAD_REQUEST);
    }

    const { lat, lon } = coordinates;

    return this.locationService.getStoresWithinRadius(lat,lon);
}

@Get('hello')
async helloRota(): Promise<string>  {
    return 'Olá! Tudo está funcionando.';
}

}
