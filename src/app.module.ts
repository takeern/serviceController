import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

//middleware 
import { FiterDataMiddleware } from './middleware/fiterSpiderData.middleware';
import { CountMiddleware } from './middleware/count.middleware';


// modules
import { LogModule } from './module/log.module';
import { RedisModule } from './module/redis.module';

@Module({
    imports: [LogModule, RedisModule],
    controllers: [AppController],
    providers: [AppService],
})
export class ApplicationModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(CountMiddleware, FiterDataMiddleware).forRoutes(AppController);
    }
}
