import { Injectable } from '@nestjs/common';
import { NestMiddleware } from '@nestjs/common';

import { LogService } from '../services/log.service';

@Injectable()
export class CountMiddleware implements NestMiddleware {
    constructor(private readonly logService: LogService) {
        this.logService = logService;
    }
    resolve () {
        return (req, res, next) => {
            try {
                const json = {
                    path: req.path,
                    query: req.query,
                    ip: req.ip,
                }
                this.logService.count(json);
                next();
            } catch(e) {
                next();
            }
        }
    }
}