import { LocationService } from '../Service/LocationService';
import { OsrmService } from '../Service/osrmService';
import { ViaCepService } from '../Service/GetCep-service';
import { Model } from 'mongoose';
import { Logger, HttpException, HttpStatus } from '@nestjs/common';

jest.mock('../service/osrmService', () => {
  return {
    OsrmService: jest.fn().mockImplementation(() => ({
      getDistance: jest.fn(),
    })),
  };
});

const mockLojaModel = {
  find: jest.fn(),
};

describe('LocationService', () => {
  let locationService: LocationService;
  let osrmService: OsrmService;

  beforeEach(() => {
    osrmService = {
      getDistance: jest.fn(),
    } as unknown as OsrmService;
  
    locationService = new LocationService(
      osrmService,
      new ViaCepService(),
      mockLojaModel as unknown as Model<any>,
    );
    jest.clearAllMocks();
  });
  

  it('deve lançar uma exceção se nenhuma loja estiver cadastrada', async () => {
    mockLojaModel.find.mockResolvedValueOnce([]);

    await expect(locationService.getStoresWithinRadius(0, 0)).rejects.toThrow(
      new HttpException('Nenhuma loja cadastrada.', HttpStatus.NOT_FOUND),
    );
  });

  it('deve lançar uma exceção se nenhuma loja estiver dentro do raio especificado', async () => {
    const lojasMock = [
      { latitude: -1, longitude: -1 },
      { latitude: 1, longitude: 1 },
    ];
    mockLojaModel.find.mockResolvedValueOnce(lojasMock);

    (osrmService.getDistance as jest.Mock).mockResolvedValueOnce(2000000); 

    await expect(locationService.getStoresWithinRadius(0, 0, 1)).rejects.toThrow(
      new HttpException('Nenhuma loja encontrada no raio especificado', HttpStatus.NOT_FOUND),
    );
  });

  it('deve retornar lojas dentro do raio especificado, ordenadas por distância', async () => {
    const lojasMock = [
      { latitude: -1, longitude: -1 },
      { latitude: 1, longitude: 1 },
    ];
    mockLojaModel.find.mockResolvedValueOnce(lojasMock);

    (osrmService.getDistance as jest.Mock)
      .mockResolvedValueOnce(50000) 
      .mockResolvedValueOnce(25000); 

    const resultado = await locationService.getStoresWithinRadius(0, 0, 100);

    expect(resultado).toEqual([
      { latitude: 1, longitude: 1, distance: 25000 },
      { latitude: -1, longitude: -1, distance: 50000 },
    ]);
  });
});
