import mongoose, { Schema, Document } from "mongoose";
import { IFrete } from "../Interfaces/interfaces";

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
  frete?: IFrete[];
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
  frete: [
    {
      prazo: { type: String, required: true },
      preco: { type: String, required: true },
      descricao: { type: String, required: true },
    },
  ],
});

export default LojasSchema;