import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { OsrmService } from './osrmService';
import {ViaCepService} from './GetCep-service';
import { Model } from 'mongoose';
import {LojasSchema, ILoja} from '../data/Lojas';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class LocationService {
    private readonly logger = new Logger(LocationService.name);

    constructor(
        private readonly osrmService: OsrmService,
        private readonly viaCepService: ViaCepService,
        @InjectModel('Loja') private readonly lojaModel: Model<ILoja> 
    ) {
        console.log('OsrmService inicializado:', this.osrmService);
    }
    async getStoresWithinRadius(lat: number, lon: number,radius: number = 100): Promise<any[]> {
        const coordinates = await this.lojaModel.find();

        if (!coordinates) {
            this.logger.warn('Nenhuma loja encontrada no banco de dados');
            throw new HttpException('CEP não encontrado', HttpStatus.NOT_FOUND);
        }

        this.logger.log(`Coordenadas obtidas: Latitude - ${lat}, Longitude - ${lon}`);
        const stores = await this.lojaModel.find();

        const storesWithDistance = await Promise.all(
            stores.map(async (store) => {
                const distance = await this.osrmService.getDistance(
                    { lat, lon },
                    { lat: store.latitude, lon: store.longitude }
                );
                return { ...store.toJSON(), distance };
            })
        );
        const storesWithinRadius = storesWithDistance
        .filter((store) => store.distance <= radius * 1000) 
        .sort((a, b) => a.distance - b.distance); 

    if (storesWithinRadius.length === 0) {
        this.logger.warn('Nenhuma loja encontrada dentro do raio especificado');
            throw new HttpException(
                'Nenhuma loja encontrada no raio especificado',
                HttpStatus.NOT_FOUND
            );
        }

 this.logger.log(`Lojas encontradas dentro do raio de ${radius}km: ${storesWithinRadius.length}`);
    return storesWithinRadius;
}
}
