import { Injectable, OnModuleInit } from '@nestjs/common';
import {
    Client,
    GrpcMethod,
    ClientGrpc,
} from '@nestjs/microservices';

import { grpcClientOptions } from '../options/grpc-client.options';
import { Observable } from 'rxjs';

interface BookService {
    getBookDesc(data: { BookName: string }): Observable<any>;
    getBookList(data: { BookNumber: string }): Observable<any>;
    getBookData(data: { BookNumber: string, BookHref: string }): Observable<any>;
    downloadBook(data: { BookNumber: string }): Observable<any>;
}

interface Iconfig {
	bookName?: string;
	bookNumber?: string;
	bookHref?: string;
}

@Injectable()
export class ProxyService implements OnModuleInit {
    @Client(grpcClientOptions) private readonly client: ClientGrpc;
    private bookService: BookService;

    onModuleInit() {
        this.bookService = this.client.getService<BookService>('Book');
    }

    getBookNumber(config: Iconfig) {
        return this.bookService.getBookDesc({BookName : config.bookName});
    }

    getBookList(config: Iconfig) {
        return this.bookService.getBookList({BookNumber : config.bookNumber});
    }

    getBookData(config: Iconfig) {
        return this.bookService.getBookData({
            BookNumber: config.bookNumber,
            BookHref: config.bookHref,
        });
    }

    getBookAllData(config: Iconfig) {
        return this.bookService.downloadBook({BookNumber : config.bookNumber});
    }
}