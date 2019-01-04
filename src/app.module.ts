import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisService } from './services/redis.services';

//middleware 
import { FiterDataMiddleware } from './middleware/fiterSpiderData.middleware';

@Module({
    imports: [],
    controllers: [AppController],
    providers: [AppService, RedisService],
})
export class ApplicationModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(FiterDataMiddleware).forRoutes(AppController);
    }
}
