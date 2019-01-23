import { Injectable } from '@nestjs/common';

const path = require('path');
const winston = require('winston');

@Injectable()
export class LogService {
    public levels: object;
    public gpath: string;
    public logger: any;
    public logPaths: {};
    public logTime: string;
    public cancleId: NodeJS.Timeout;
    constructor() {
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
            count: 4,
        };
        this.logPaths = {};
        return this;
    }

    onModuleInit() {
        this.gpath = process.cwd(); 
        this.setLogTime();
    }

    async setLogTime() {
        if (this.cancleId) {
            clearTimeout(this.cancleId);
        }
        this.cancleId = this.checkTime();
        const date = new Date();
        this.logTime = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

        for (let i in this.levels) {
            this.logPaths[i] =  path.join(this.gpath, `/logs/${i}-${this.logTime}.log`);
        }
        this.createLog();
    }
    createLog(): LogService {
        const formatter = winston.format.combine(
            winston.format.json(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(info => {
                // 输出格式
                // TODO message字段是Symbol对象，对于error级的日志，需要遍历message的Symbol拿到error对象
                const showInfo = { time: info.timestamp, pid: process.pid, level: info.level, message: info.message };
                return JSON.stringify(showInfo);
            })
        );
        this.logger = winston.createLogger({
            levels: this.levels,
            format: formatter,
            transports: [
            // 'error'级别的日志处理
                new winston.transports.File({ 
                    level: 'error',
                    filename: (<any>this.logPaths).error,
                }),
                new winston.transports.File({
                    level: 'warn',
                    filename: (<any>this.logPaths).warn,
                }),
                new winston.transports.File({
                    level: 'info',
                    filename: (<any>this.logPaths).info,
                }),
                new winston.transports.File({
                    level: 'debug',
                    filename: (<any>this.logPaths).debug,
                }),
                new winston.transports.File({
                    level: 'count',
                    filename: (<any>this.logPaths).count,
                }),
            // '所有的日志处理, maxFiles是回滚时间，超时会删除旧文件，如果不设置，则不会删除'
                
            // 控制台输出
            ],
        });
        return this;
    }
    checkTime() {
        const date = new Date();
        const time = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
        const cancleId = setTimeout(() => {
            this.setLogTime();
        }, time);
        return cancleId;
    }
    error(data: string| object): LogService{
        this.logger.error(data);
        return this;
    }
    warn(data: string| object): LogService{
        this.logger.warn(data);
        return this;
    }
    info(data: string| object): LogService{
        this.logger.info(data);
        return this;
    }
    debug(data: string| object): LogService{
        this.logger.debug(data);
        return this;
    }
    count(data: string| object): LogService{
        this.logger.count(data);
        return this;
    }
}