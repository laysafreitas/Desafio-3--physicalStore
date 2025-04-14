import { Injectable, Logger } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class ConfigService {
    private readonly logger = new Logger(ConfigService.name);

    async connectToDatabase() {
        if (!process.env.DATABASE) {
            throw new Error('A variável de ambiente DATABASE não está definida!');
        }

        try {
            const connection = await mongoose.connect(process.env.DATABASE, {
                serverSelectionTimeoutMS: 5000,
                maxPoolSize: 10,
                family: 4,
            });

            this.logger.log('DB conectado com sucesso', { connections: connection.connections });
        } catch (error:any) {
            this.logger.error('Erro ao conectar ao DB', { error: error.message });
            throw error;
        }
    }
}
