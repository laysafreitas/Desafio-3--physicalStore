import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLojaDto } from '../data/createLoja';
import { ILoja } from '../data/Lojas';

@Injectable()
export class LojaService {
    constructor(@InjectModel('Loja') private readonly lojaModel: Model<ILoja>) {}

    async createLoja(data: CreateLojaDto): Promise<ILoja> {
        const loja = new this.lojaModel(data);
        return await loja.save();

    }
  
    async salvarFrete(cep: string, freteData: any[]): Promise<ILoja> {
        const loja = await this.lojaModel.findOne({ cep });
    
        if (!loja) {
          throw new Error('Loja não encontrada.');
        }
    
        loja.frete = freteData; 
        return loja.save(); 
      }
}
