import mongoose, { Schema, Document } from "mongoose";

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
  longitude: { type: Number, required: true }
});

export default LojasSchema;