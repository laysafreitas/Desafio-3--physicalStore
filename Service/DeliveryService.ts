import { Injectable, Logger} from '@nestjs/common';

@Injectable()
export class DeliveryService {
    private readonly logger = new Logger(DeliveryService.name);

    async calculateDeliveryValueAndTime(distanceInKm: number, type: string): Promise<{ value: string; time: string }> {
        this.logger.log(`Calculando entrega para tipo: ${type}, distância: ${distanceInKm} km`);

        if (type === 'PDV') {
            if (distanceInKm <= 50) {
                const dynamicDeliveryTime = await this.calculateDynamicDeliveryTime(distanceInKm);
                return {
                    value: '$15.00',
                    time: dynamicDeliveryTime,
                };
            } else {

                const freteDetails = await this.calculateFrete(distanceInKm);
                return {
                    value: freteDetails.price,
                    time: freteDetails.time,
                };
            }
        } else {
            const freteDetails = await this.calculateFrete(distanceInKm);
            return {
                value: freteDetails.price,
                time: freteDetails.time,
            };
        }
    }

    private async calculateDynamicDeliveryTime(distanceInKm: number): Promise<string> {
        this.logger.log(`Calculando prazo dinâmico para distância: ${distanceInKm} km`);

       
        if (distanceInKm <= 20) {
            return '1 dia útil';
        } else if (distanceInKm <= 50) {
            return '2 dias úteis';
        } else {
            return '3 dias úteis'; 
        }
    }

    private async calculateFrete(distanceInKm: number): Promise<{ price: string; time: string }> {
        this.logger.log(`Calculando frete para distância: ${distanceInKm} km`);
        const price = `$${(distanceInKm * 0.5).toFixed(2)}`; 
        const time = `${Math.ceil(distanceInKm / 20)} dias úteis`; 
        return { price, time };
    }
}
