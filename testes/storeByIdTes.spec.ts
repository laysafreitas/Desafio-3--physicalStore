import { Test, TestingModule } from '@nestjs/testing';
import { FreteController } from '../controller/FreteController';
import { LojaService } from '../Service/lojasService';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ILoja, StoreType } from '../data/Lojas';
import { ViaCepService } from '../Service/GetCep-service';
import { LocationService } from '../Service/LocationService';
import { MelhorEnvioApi } from '../Service/calculateFreteWithMelhorEnvio';

describe('LojaController - storeById', () => {
    let freteController: FreteController;
    let lojaService: LojaService;
    let viaCepService: ViaCepService;
    let locationService: LocationService;
    let melhorEnvioApi: MelhorEnvioApi;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FreteController],
            providers: [
                {
                    provide: LojaService,
                    useValue: { getStoreById: jest.fn() },
                },
                {
                    provide: ViaCepService,
                    useValue: { buscarCep: jest.fn() }, 
                },
                {
                    provide: LocationService,
                    useValue: {}, 
                },
                {
                    provide: MelhorEnvioApi,
                    useValue: {}, 
                },
            ],
        }).compile();
    
        lojaService = module.get<LojaService>(LojaService);
        freteController = module.get<FreteController>(FreteController);
    });

    it('Deve retornar loja formatada quando o ID existir', async () => {
        const mockStore: Partial<ILoja> = {
            _id: '123' as any, 
            name: 'Loja Teste',
            cep: '01000-000',
            city: 'São Paulo',
            bairro: 'Centro',
            logradouro: 'Rua Teste',
            estado: 'SP',
            ddd: '11',
            latitude: -23.5631,
            longitude: -46.6564,
            type: 'PDV' as StoreType, 
            supportsDelivery: true,
            preparationTime: 30, 
            telephoneNumber: '11999999999', 
            emailAddress: 'loja@teste.com', 
        };
        
        

        jest.spyOn(lojaService, 'getStoreById').mockResolvedValue(mockStore as ILoja);

        const result = await freteController.storeById('123');

        expect(result).toEqual({
            stores: [
                {
                    storeID: '123',
                    storeName: 'Loja Teste',
                    type: 'PDV',
                    latitude: '-23.5631',
                    longitude: '-46.6564',
                    address1: 'Rua Teste',
                    address3: 'Centro',
                    city: 'São Paulo',
                    state: 'SP',
                    postalCode: '01000-000',
                },
            ],
            limit: 1,
            offset: 1,
            total: 1,
        });
    });

    it('Deve lançar HttpException se a loja não for encontrada', async () => {
        jest.spyOn(lojaService, 'getStoreById').mockResolvedValue(null);

        await expect(freteController.storeById('999')).rejects.toThrow(
            new HttpException('Loja não encontrada.', HttpStatus.NOT_FOUND),
        );
    });

    it('Deve lançar HttpException em caso de erro inesperado', async () => {
        jest.spyOn(lojaService, 'getStoreById').mockRejectedValue(new Error('Erro interno'));

        await expect(freteController.storeById('500')).rejects.toThrow(
            new HttpException('Erro interno', HttpStatus.INTERNAL_SERVER_ERROR),
        );
    });
});
