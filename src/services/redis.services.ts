import { Injectable } from '@nestjs/common';
import { RedisConfig } from '../interface/CONFIG.STATE'

const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

@Injectable()
export class RedisService {
    public client: any;
    public multi: any;
    public shouldRedisExec: boolean;
    constructor() {
        this.shouldRedisExec = false;
        this.init();
    }
    init() {
        this.client = redis.createClient({
            retry_strategy: 3000,
        });
        this.client.auth('aybookredis');
        this.multi = this.client.multi();
    }

    setRequest() {
        setTimeout(() => {
            this.shouldRedisExec = false;
            this.multi.exec((err, rep) => {
                console.log(rep);
            })
        }, RedisConfig.queueTime);
    }

    setBookNumber(origin: string, bookName: string, bookNumber: string) {
        if (!this.shouldRedisExec) {
            this.shouldRedisExec = true;
            this.setRequest();
        }
        this.multi.hmset(origin, bookName, bookNumber);
    }

    async getBookNumber(origin: string, bookName: string) {
        const bookNumber = await this.client.hgetAsync(origin, bookName);
        return bookNumber;
    }
}