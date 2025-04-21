import { Test, TestingModule } from '@nestjs/testing';
import { FreteController } from '../controller/FreteController';
import { LojaService } from '../Service/lojasService';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ILoja, StoreType } from '../data/Lojas';
import { LocationService } from '../Service/LocationService';
import { ViaCepService } from '../Service/GetCep-service';
import { MelhorEnvioApi } from '../Service/calculateFreteWithMelhorEnvio';

describe('LojaController - storeByState', () => {
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
                    useValue: { getStoresByState: jest.fn() },
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

    it('Deve retornar lojas formatadas quando houver lojas no estado', async () => {
        const mockStores: Partial<ILoja>[] = [
            {
                _id: '123' as any,
                name: 'Loja Teste 1',
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
                emailAddress: 'loja1@teste.com',
            },
            {
                _id: '456' as any,
                name: 'Loja Teste 2',
                cep: '20000-000',
                city: 'Rio de Janeiro',
                bairro: 'Bairro Novo',
                logradouro: 'Avenida Teste',
                estado: 'RJ',
                ddd: '21',
                latitude: -22.1234,
                longitude: -44.5678,
                type: 'PDV' as StoreType,
                supportsDelivery: false,
            },
        ];
        
        
        
    jest.spyOn(lojaService, 'getStoresByState').mockResolvedValue(mockStores as ILoja[]);

        const result = await freteController.storeByState('SP');

        expect(result).toEqual({
            stores: [
                {
                    storeID: '123',
                    storeName: 'Loja Teste 1',
                    type: 'PDV',
                    latitude: '-23.5631',
                    longitude: '-46.6564',
                    address1: 'Rua Teste',
                    address3: 'Centro',
                    city: 'São Paulo',
                    state: 'SP',
                    postalCode: '01000-000',
                },
                {
                    storeID: '456',
                    storeName: 'Loja Teste 2',
                    type: 'PDV',
                    latitude: '-22.1234',
                    longitude: '-44.5678',
                    address1: 'Avenida Teste',
                    address3: 'Bairro Novo',
                    city: 'Rio de Janeiro',
                    state: 'RJ',
                    postalCode: '20000-000',
                },
            ],
            limit: 2,
            offset: 0,
            total: 2,
        });
    });

    it('Deve lançar HttpException se o estado não for uma sigla válida', async () => {
        await expect(freteController.storeByState('São Paulo')).rejects.toThrow(
            new HttpException('O estado deve ser uma sigla com 2 letras!', HttpStatus.BAD_REQUEST),
        );
    });

    it('Deve lançar HttpException se nenhuma loja for encontrada', async () => {
        jest.spyOn(lojaService, 'getStoresByState').mockResolvedValue([]);

        await expect(freteController.storeByState('ZZ')).rejects.toThrow(
            new HttpException('Nenhuma loja encontrada no estado informado.', HttpStatus.NOT_FOUND),
        );
    });

    it('Deve lançar HttpException em caso de erro inesperado', async () => {
        jest.spyOn(lojaService, 'getStoresByState').mockRejectedValue(new Error('Erro interno'));

        await expect(freteController.storeByState('SP')).rejects.toThrow(
            new HttpException('Erro interno', HttpStatus.INTERNAL_SERVER_ERROR),
        );
    });
});
