import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLojaDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    cep!: string;

    @IsString()
    @IsOptional()
    city!: string;

    @IsString()
    @IsOptional()
    bairro?: string;

    @IsString()
    @IsOptional()
    logradouro?: string;

    @IsString()
    @IsOptional()
    estado?: string;

    @IsString()
    @IsOptional()
    ddd?: string;
}
