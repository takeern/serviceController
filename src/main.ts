import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { WsAdapter } from '@nestjs/websockets/adapters';
import { grpcClientOptions } from './options/grpc-client.options';

const heapdump = require('heapdump');
const memwatch = require('node-memwatch');
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  app.useWebSocketAdapter(new WsAdapter(app.getHttpServer()));
  app.connectMicroservice(grpcClientOptions);
  await app.listen(8083, '0.0.0.0');

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();

// memwatch.on('leak', (info) => console.log('leak', info));
// memwatch.on('stats', (info) => console.log('stats', info));