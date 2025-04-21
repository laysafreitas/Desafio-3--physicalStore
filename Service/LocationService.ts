import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { OsrmService } from './osrmService';
import {ViaCepService} from './GetCep-service';
import { Model } from 'mongoose';
import { ILoja} from '../data/Lojas';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class LocationService {
    private readonly logger = new Logger(LocationService.name);
    private readonly requestInProgress = new Set<string>();

    constructor(
        private readonly osrmService: OsrmService,
        private readonly ViaCepService: ViaCepService,
        @InjectModel('Loja') private readonly lojaModel: Model<ILoja> 
    ) {
        console.log('OsrmService inicializado:', this.osrmService);
    }
    async getStoresWithinRadius(lat: number, lon: number,radius: number = 100): Promise<any[]> {
        this.logger.log('Chamando LocationService.getStoresWithinRadius...');
        const key = `${lat}-${lon}-${radius}`;
        if (this.requestInProgress.has(key)) {
            this.logger.log(`Já existe uma requisição em andamento para ${key}`);
            return []; 
        }
        this.requestInProgress.add(key);
        try{
        const stores = await this.lojaModel.find();
        if (!stores || stores.length === 0) {
            this.logger.warn('Nenhuma loja encontrada no banco de dados');
            throw new HttpException('Nenhuma loja cadastrada.', HttpStatus.NOT_FOUND);
        }

        const storesWithDistance = await Promise.all(
            stores.map(async (store) => {
                const distance = await this.osrmService.getDistance(
                    { lat, lon },
                    { lat: store.latitude, lon: store.longitude }
                );
                return { ...store, distance };
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
}finally{
    this.requestInProgress.delete(key);
}
    }
}
