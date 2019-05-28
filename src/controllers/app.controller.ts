import { Controller, Get, OnModuleInit, Query, Body, HttpStatus } from '@nestjs/common';
import { SpiderService } from '../services/spider.service';
import { RedisService } from '../services/redis.service';
import { SpiderOrigin } from '../interface/CONFIG.STATE';
import { grpcClientOptions } from '../options/grpc-client.options';
import {
    Client,
    GrpcMethod,
    ClientGrpc,
} from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface Iconfig {
	bookName?: string;
	bookNumber?: string;
	bookHref?: string;
}

interface BookService {
    getBookNumber(data: { BookName: string }): Observable<any>;
}

@Controller()
export class AppController implements OnModuleInit {
    @Client(grpcClientOptions) private readonly client: ClientGrpc;
    private bookService: BookService;
    constructor(
        private readonly appService: SpiderService,
        private readonly redisService: RedisService,
        ) {}

    onModuleInit() {
        this.bookService = this.client.getService<BookService>('BookService');
    }
    async fiterData (qs: Iconfig) {
        if (qs.bookNumber) {
            return {
                bookNumber: qs.bookNumber
            }
        }
        if(qs.bookName) {
            const bookNumber = await this.redisService.getBookNumber('ixspider', qs.bookName);
            if (bookNumber) {
                return {
                    bookNumber
                }
            } 
            return false;
        }
    }

    @Get()
    getHello(@Query() qu) {
        return this.appService.getHello();
    }

    @Get('grpcTest')
    getBookNumber1(@Query() qs) {
        const res = this.bookService.getBookNumber({BookName: qs.bookName});
        console.log(res);
        return res;
    }

    @Get('getBookNumber')
    async getBookNumber(@Query() qs) {
        let bookNumber  = await this.redisService.getBookNumber('ixspider', qs.bookName);
        if (!bookNumber) {
            const config = {
                bookName: qs.bookName
            }
            bookNumber = await this.appService.getBookNumber(config);
            this.redisService.setBookNumber('ixspider', config.bookName, bookNumber);
        }
        return bookNumber;
    }
    @Get('getBookList')
    async getBookList(@Query() qs) {
        let config = await this.fiterData(qs);
        let shouldRedisSet: boolean = false;
        if (!config) {
            config = qs;
            shouldRedisSet = true;
        }
        const res = await this.appService.getBookList(<Iconfig>config);
        if (shouldRedisSet) {
            this.redisService.setBookNumber('ixspider', qs.bookName, (<any>res).bookNumber);
        }
        return res;
    }
    @Get('getBookData')
    async getBookData(@Query() qs) {
        let config = await this.fiterData(qs);
        let shouldRedisSet: boolean = false;
        if (!config) {
            config = qs;
            shouldRedisSet = true;
        }
        (<Iconfig>config).bookHref = qs.bookHref;
        const res = await this.appService.getBookData(<Iconfig>config);
        
        if (shouldRedisSet) {
            this.redisService.setBookNumber('ixspider', qs.bookName, (<any>res).bookNumber);
        }
        return res;
    }
    
    @Get('getBookInitData')
    async getBookInitData(@Query() qs) {
        let table = await this.getBookList(qs);
        let bookData = null;
        if (table && (<any>table).bookList && (<any>table).bookList.length !== 0) {
            bookData = await this.getBookData({
                bookHref: (<any>table).bookList[0].href,
                bookNumber: qs.bookNumber,
            });
        } else {
            table = 'can not find'
        }
        return {
            code: 200,
            bookData,
            table
        };
    }
}
