import { Module } from '@nestjs/common';
import { ConfigService } from '../Service/configService';

@Module({
    providers: [ConfigService], 
    exports: [ConfigService],   
})
export class ConfigModule {}
