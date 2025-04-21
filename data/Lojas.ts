import mongoose, { Schema, Document } from "mongoose";


export enum StoreType {
  PDV = 'PDV',
  LOJA = 'LOJA',
}

export interface ILoja extends Document {
  name: string;
  cep: string;
  city:string;
  bairro: string;
  logradouro: string;
  estado: string;
  ddd:string;
  latitude: number;
  longitude: number;
  preparationTime?: number;
  telephoneNumber?: string;
  emailAddress?: string;
  type: StoreType;
  supportsDelivery: boolean;
}

export const LojasSchema: Schema = new Schema({
  name: { type: String, required: true },
  cep: { type: String, required: true },
  city:{type: String, require:true},
  bairro:{type: String, require:true},
  logradouro:{type: String, require: true},
  estado:{type: String, require:true},
  ddd:{type: String, require:true},
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  preparationTime: { type: Number, default: 0 }, 
  telephoneNumber: { type: String, default: '0000-0000' }, 
  emailAddress: { type: String, default: 'email@mockado.com' }, 
  type: { type: String, enum: ['PDV', 'LOJA'], required: true },
supportsDelivery: { type: Boolean, default: false },
});

export default LojasSchema;