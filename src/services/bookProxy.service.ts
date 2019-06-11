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

    static stringCode(k) {
        return new Promise((reslove, reject) => {
			k.subscribe({
				next: (v) => {
                    let data;
                    if (typeof v === 'string') {
                        data = JSON.parse(String.fromCharCode.apply(null, v));
                    } else {
                        data = v;
                    }
                    reslove(data);
				},
				error: (err) => reject(err),
			});
		});
    }

    onModuleInit() {
        this.bookService = this.client.getService<BookService>('Book');
    }

    getBookNumber(config: Iconfig) {
        const k = this.bookService.getBookDesc({BookName : config.bookName});
        return ProxyService.stringCode(k);
    }

    getBookList(config: Iconfig) {
        const k = this.bookService.getBookList({BookNumber : config.bookNumber});
        return ProxyService.stringCode(k);
    }

    getBookData(config: Iconfig) {
        const k = this.bookService.getBookData({
            BookNumber: config.bookNumber,
            BookHref: config.bookHref,
        });
        return ProxyService.stringCode(k);
    }

    getBookAllData(config: Iconfig) {
        return this.bookService.downloadBook({BookNumber : config.bookNumber});
    }
}