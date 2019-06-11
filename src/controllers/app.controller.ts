import { Controller, Get, OnModuleInit, Query, Body, HttpStatus } from '@nestjs/common';
import { ProxyService } from '../services/bookProxy.service';
import { RedisService } from '../services/redis.service';
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


@Controller()
export class AppController{
    constructor(
        private readonly appService: ProxyService,
        private readonly redisService: RedisService,
    ) {}

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
        if (table && (<any>table).BookList && (<any>table).BookList.length !== 0) {
            bookData = await this.getBookData({
                bookHref: (<any>table).BookList[0].href,
                bookNumber: qs.bookNumber,
            });
        }
        return {
            code: 200,
            bookData,
            table
        };
    }
}
