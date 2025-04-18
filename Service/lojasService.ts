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
    async getAllStores(): Promise<ILoja[]> {
        return await this.lojaModel.find().exec(); 
    }
    async getStoreById(id: string): Promise<ILoja | null> {
        return await this.lojaModel.findById(id).exec();
    }
    async getStoresByState(state: string): Promise<ILoja[]> {
        return await this.lojaModel.find({ estado: state }).exec();
    }
}
