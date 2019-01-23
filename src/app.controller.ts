import { Controller, Get,  Req, Res, Param, Post, Query, Body, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { RedisService } from './services/redis.service';
import { SpiderOrigin } from './interface/CONFIG.STATE';

interface Iconfig {
	bookName?: string;
	bookNumber?: string;
	bookHref?: string;
}

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly redisService: RedisService
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

    @Get()
    getHello(@Query() qu) {
        return this.appService.getHello();
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
    @Get('getBookAllData')
    async getBookAllData(@Query() qs) {
        const b = await this.appService.getBookAllData(qs);
        return b;
    }
}
