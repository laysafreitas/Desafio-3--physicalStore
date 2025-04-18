import { Module } from '@nestjs/common';
import { MelhorEnvioApi } from '../Service/calculateFreteWithMelhorEnvio';
import { LocationService } from '../Service/LocationService';
import { OsrmService } from '../Service/osrmService';
import { ViaCepService } from '../Service/GetCep-service';
import {LojasSchema} from '../data/Lojas';
import { MongooseModule } from '@nestjs/mongoose';
import { FreteController } from '../controller/FreteController';
import { SharedModule } from './SharedModule';
import { LojasModule } from './lojasModule';
import { LojaService } from '../Service/lojasService';



@Module({
  imports: [
    LojasModule,
    SharedModule,
    MongooseModule.forFeature([{ name: 'Loja', schema: LojasSchema }]), 
  ],
  controllers: [FreteController], 
  providers: [MelhorEnvioApi,LocationService,OsrmService,ViaCepService,LojaService],
  exports: [MelhorEnvioApi,LocationService], 
})
export class MelhorEnvioModule {}
