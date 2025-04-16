import { Controller, Get, Param, HttpException, HttpStatus,Logger, Body } from '@nestjs/common';
import { calculateFreteWithMelhorEnvio } from '../Service/calculateFreteWithMelhorEnvio';
import { LojaService } from '../Service/lojasService';


@Controller('frete')
export class FreteController {
    private readonly logger = new Logger (FreteController.name)
    constructor(private readonly calculateFreteWithMelhorEnvio: calculateFreteWithMelhorEnvio,
      private readonly lojaService: LojaService,
    ) {}

  
    @Get(':cep')
    async getFrete(@Param('cep') cep: string): Promise<any> {
      if (!cep || !/^\d{8}$/.test(cep)) {
        throw new HttpException('CEP inválido! O formato deve conter 8 dígitos.', HttpStatus.BAD_REQUEST);
      }
  
      try {
        this.logger.log(`Calculando frete para o CEP: ${cep}`);
        const frete = await this.calculateFreteWithMelhorEnvio.calculateFrete(cep);

        if (!frete) {
          throw new HttpException('Erro ao calcular o frete. Dados não encontrados.', HttpStatus.NOT_FOUND);
        }

        this.logger.log(`Frete calculado com sucesso para o CEP: ${cep}`)
       return frete;
      } catch (error:any) {
        throw new HttpException(
          error.message || 'Erro ao calcular o frete.',
          error.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }