import { Test, TestingModule } from '@nestjs/testing';
import { FreteController } from '../controller/FreteController';
import { LocationService } from '../Service/LocationService';
import { ViaCepService } from '../Service/GetCep-service';
import { LojaService } from '../Service/lojasService';
import { Logger } from '@nestjs/common';
import { MelhorEnvioApi } from '../Service/calculateFreteWithMelhorEnvio';

describe('FreteController - storeByCep', () => {
  let controller: FreteController;
  let locationService: LocationService;
  let viaCepService: ViaCepService;
  let lojaService: LojaService;
  let melhorEnvioApi: MelhorEnvioApi;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FreteController],
      providers: [
        {
          provide: LocationService,
          useValue: {
            getStoresWithinRadius: jest.fn(),
          },
        },
        {
          provide: ViaCepService,
          useValue: {
            getViaCep: jest.fn(),
          },
        },
        {
          provide: LojaService,
          useValue: {
            getStoreById: jest.fn(),
            getStoresByState: jest.fn(),
          },
        },
        {
          provide: MelhorEnvioApi, 
          useValue: {
            calcularFretePorCep: jest.fn(), 
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FreteController>(FreteController);
    locationService = module.get<LocationService>(LocationService);
    viaCepService = module.get<ViaCepService>(ViaCepService);
    lojaService = module.get<LojaService>(LojaService);
    melhorEnvioApi = module.get<MelhorEnvioApi>(MelhorEnvioApi);
  });

  it('deve retornar lojas formatadas e dados completos para um CEP válido', async () => {
    const mockStores = [
      { _id: '1', name: 'Loja A', latitude: -10.0, longitude: -50.0, logradouro: 'Rua A', bairro: 'Bairro A', city: 'Cidade A', estado: 'Estado A', cep: '12345678' },
      { _id: '2', name: 'Loja B', latitude: -11.0, longitude: -51.0, logradouro: 'Rua B', bairro: 'Bairro B', city: 'Cidade B', estado: 'Estado B', cep: '87654321' },
    ];
    jest.spyOn(viaCepService, 'getViaCep').mockResolvedValue({
        lat: -10.0,
        lon: -50.0,
      });
  
      jest.spyOn(locationService, 'getStoresWithinRadius').mockResolvedValue(mockStores);
  
      jest.spyOn(melhorEnvioApi, 'calcularFretePorCep').mockResolvedValue([
        { distance: 10 },
        { distance: 20 },
    ]);

      const result = await controller.storeByCep('12345678');
  
      console.log('Final Result:', result);
      expect(result.stores).toHaveLength(2);
      expect(result.stores[0].storeName).toBe('Loja A');
    });
});
