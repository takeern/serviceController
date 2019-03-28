import { Module } from '@nestjs/common';

import { UlitService } from '../services/ulit.service';

@Module({
    providers: [ UlitService ],
    exports: [ UlitService ]
})
export class UlitModule {}