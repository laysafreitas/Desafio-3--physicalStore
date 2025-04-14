import { Module } from '@nestjs/common';
import { ViaCepService } from '../Service/GetCep-service.ts';
import {LocationService}  from '../Service/LocationService.ts';
import { OsrmService } from '../Service/osrmService.ts';
import { LojasSchema } from '../data/Lojas.ts';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: 'Loja', schema: LojasSchema }]),
  ],
  providers: [LocationService,OsrmService,ViaCepService],
  exports: [LocationService,ViaCepService],
})
export class LocationModule {}
