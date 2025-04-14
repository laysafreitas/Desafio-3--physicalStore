import { Module } from '@nestjs/common';
import { OsrmService } from '../Service/osrmService';

@Module({
    providers: [OsrmService],
    exports: [OsrmService], 
})
export class OsrmModule {}
