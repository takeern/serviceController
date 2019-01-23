import { Module } from '@nestjs/common';

import { RedisService } from '../services/redis.service';
import { LogModule } from './log.module';

@Module({
    imports: [LogModule],
    providers: [ RedisService ],
    exports: [ RedisService ]
})
export class RedisModule {}