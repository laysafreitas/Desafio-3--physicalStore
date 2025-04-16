import { Module } from '@nestjs/common';
import { ViaCepService } from '../Service/GetCep-service';

@Module({
  providers: [ViaCepService],
  exports: [ViaCepService], 
})
export class SharedModule {}