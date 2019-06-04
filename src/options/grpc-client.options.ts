import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'grpc',
    url: 'localhost: 2333',
    protoPath: '/Users/bilibili/reading/serviceController/src/options/bookService.proto',
  },
};
