import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ViacepResponse } from '../Interfaces/interfaces';
import { location } from '../Interfaces/interfaces';

@Injectable()
export class ViaCepService{
private readonly logger = new Logger(ViaCepService.name);

async getViaCep(cep: string): Promise<location | null> {
  if (!/^\d{8}$/.test(cep)) {
    this.logger.error(`Formato de CEP inválido: ${cep}`);
    return null;
}
    try {
        const response = await axios.get<ViacepResponse>(`http://viacep.com.br/ws/${cep}/json/`);
        
        if (response.data.erro) {
          this.logger.error('Cep não encontrado na API ViaCep');
          throw new Error('CEP não encontrado');
        }

        const address = `${response.data.logradouro}, ${response.data.localidade}, ${response.data.uf}`;
        const nominatimResponse = await axios.get<location>('https://nominatim.openstreetmap.org/search', {
          params: { q: address, format: 'json', limit: 1 },
      });

      const data = nominatimResponse.data;

      if (!Array.isArray(data) || data.length === 0) {
          this.logger.error('Não foi possível encontrar as coordenadas do CEP.');
          return null;
      }

      return {
          lat: Number(data[0].lat),
          lon: Number(data[0].lon),
      };
      
}catch(error){
    if (error instanceof Error) {
        this.logger.error(`Erro ao buscar a informação do CEP: ${error.message}`);
      } else {
        this.logger.error('Erro desconhecido ao buscar informações do CEP');
      }
      return null;
}
}
}