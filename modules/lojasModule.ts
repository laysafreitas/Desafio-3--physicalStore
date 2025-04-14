import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LojaController } from '../controller/lojasController';
import { LojaService } from '../Service/lojasService';
import  LojaSchema  from '../data/Lojas';
import { LocationModule } from './LocationModule';
import { LocationService } from '../Service/LocationService';
import { OsrmModule } from './OsrmModule';
import { OsrmService } from '../Service/osrmService';


@Module({
    imports: [
        LocationModule,
        OsrmModule,
        MongooseModule.forFeature([{ name: 'Loja', schema: LojaSchema }]), 
    ],
    controllers: [LojaController],
    providers: [LojaService,LocationService,OsrmService],
    exports: [LojaService, LocationService,OsrmService],

})
export class LojasModule {}
