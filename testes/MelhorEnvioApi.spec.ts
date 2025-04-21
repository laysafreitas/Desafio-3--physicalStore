import { MelhorEnvioApi } from '../Service/calculateFreteWithMelhorEnvio'; 
import { Logger, HttpException, HttpStatus } from '@nestjs/common';


jest.mock('axios', () => ({
  post: jest.fn(),
}));

import axios from 'axios';

describe('MelhorEnvioApi', () => {
  let melhorEnvioApi: MelhorEnvioApi;

  beforeEach(() => {
    melhorEnvioApi = new MelhorEnvioApi();
    jest.clearAllMocks();
  });

  it('deve lançar uma exceção se o CEP estiver inválido', async () => {
    const cepInvalido = '123';

    await expect(melhorEnvioApi.calcularFretePorCep(cepInvalido)).rejects.toThrow(
      new HttpException('Formato de CEP inválido!', HttpStatus.BAD_REQUEST),
    );
  });

  it('deve lançar uma exceção se o token não estiver configurado', async () => {
    delete process.env.PsycalStore;

    const cepValido = '52110440';
    await expect(melhorEnvioApi.calcularFretePorCep(cepValido)).rejects.toThrow(
      new Error('Token MelhorEnvio não configurado!'),
    );
  });

  it('deve retornar os resultados corretos para a chamada à API', async () => {
    process.env.PsycalStore = 'fake_token';
    const cepValido = '52110440';

    const mockResponseData = [
      {
        delivery_time: 3,
        agency_service_code: '001',
        price: '10.50',
        description: 'Serviço de entrega',
      },
    ];

    (axios.post as jest.Mock).mockResolvedValueOnce({ data: mockResponseData });

    const resultado = await melhorEnvioApi.calcularFretePorCep(cepValido);

    expect(resultado).toEqual([
      {
        prazo: '3 dias úteis',
        codProdutoAgencia: '001',
        price: 'R$ 10.50',
        description: 'Serviço de entrega',
      },
    ]);
  });

  it('deve lançar uma exceção se a API retornar HTML inesperado', async () => {
    process.env.PsycalStore = 'fake_token';
    const cepValido = '52110440';

    (axios.post as jest.Mock).mockResolvedValueOnce({ data: '<html></html>' });

    await expect(melhorEnvioApi.calcularFretePorCep(cepValido)).rejects.toThrow(
      new HttpException(
        'Resposta inesperada da API Melhor Envio. Possível problema de autenticação ou configuração.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      ),
    );
  });
});
