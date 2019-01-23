import { Module } from '@nestjs/common';

import { LogService } from '../services/log.service';

@Module({
    providers: [ LogService ],
    exports: [ LogService ]
})
export class LogModule {}