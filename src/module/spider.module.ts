import { Module } from '@nestjs/common';

import { ProxyService } from '../services/bookProxy.service';

@Module({
    providers: [ ProxyService ],
    exports: [ ProxyService ]
})
export class SpiderModule {}