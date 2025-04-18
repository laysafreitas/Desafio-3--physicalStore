import { NestFactory } from '@nestjs/core';
import  {AppModule}  from "./app"
import { CustomLoggerService } from './logger/loggerService'
import 'dotenv/config';

async function bootstrap() {
  console.log('Iniciando servidor...');
    const app = await NestFactory.create(AppModule);
    const logger = app.get(CustomLoggerService);
    console.log('Aplicação iniciada.');
    const port = 3000;

    app.setGlobalPrefix('api');

    await app.listen(port, () => {
        console.log(`Servidor está rodando em http://localhost:${port}`);
      });
    }
  
    bootstrap();