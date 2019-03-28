import { Module } from '@nestjs/common';
import { DownloadService } from '../services/ws.service';
// import { ApplicationModule } from '../app.module';

import { SpiderModule } from '../module/spider.module';
import { UlitModule } from '../module/ulit.module';

@Module({
    imports: [SpiderModule, UlitModule],
    providers: [DownloadService],
})
export class DownloadModule {}
