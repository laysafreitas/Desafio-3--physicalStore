import mongoose from 'mongoose';
import LojasSchema from './Lojas';

const Loja = mongoose.model('Loja', LojasSchema); 
export default Loja;
