import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from './modules/configModule';
import { LojasModule } from './modules/lojasModule'; 
import dotenv from "dotenv";
import  {LoggerModule}  from './modules/loggerModule';
import { LocationModule } from './modules/LocationModule';
import { LojaController } from './controller/lojasController';
import { OsrmModule } from './modules/OsrmModule';
import { MelhorEnvioModule } from './modules/MelhorEnvioModule';



dotenv.config();

if (!process.env.DATABASE) {
    throw new Error('A variável DATABASE não está definida!');
}

const databaseUrl: string = process.env.DATABASE;

@Module({
    imports: [
        OsrmModule,
        ConfigModule,
        LoggerModule,
        MongooseModule.forRoot(process.env.DATABASE, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
            family: 4,
        }),
        LojasModule, 
        LocationModule,
        MelhorEnvioModule,
    ],
    controllers: [LojaController]
})
export class AppModule {}
