import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

console.log(join(__dirname, './options/bookService.proto'));
export const grpcClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'book',
    url: 'localhost: 2333',
    protoPath: '/Users/bilibili/reading/serviceController/src/options/bookService.proto',
  },
};
