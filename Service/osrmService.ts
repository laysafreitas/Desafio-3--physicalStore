import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OsrmService {
    private readonly logger = new Logger(OsrmService.name);

    async getDistance(
        start: { lat: number; lon: number },
        end: { lat: number; lon: number }
    ): Promise<number> {
        const baseUrl = 'https://router.project-osrm.org/route/v1/driving';
        const coordinates = `${start.lon},${start.lat};${end.lon},${end.lat}`;

        try {
            const response = await axios.get(`${baseUrl}/${coordinates}`, {
                params: {
                    overview: 'false', 
                    geometries: 'polyline', 
                },
            });

            const distance = response.data.routes[0].distance; 
            return distance;
        } catch (error:any) {
            this.logger.error('Erro ao acessar API OSRM', error.message);
            throw new HttpException('Erro ao calcular distância', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}