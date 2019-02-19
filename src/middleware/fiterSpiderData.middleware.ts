import { NestMiddleware } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FiterDataMiddleware implements NestMiddleware {
    fiterData(data, path) {
        let msg;
        switch (path) {
            case ('/getBookNumber'): {
                if (!data.bookName) {
                    msg = 'bookName is undefined';
                }
                break;
            }
            case ('/getBookData'): {
                if (!data.bookHref) {
                    msg = 'bookHref is undefined';
                }
                break;
            }
            default: {
                if (!data.bookNumber) {
                    msg = 'bookNumber is undefined';
                }
                break;
            }
        }
        return msg;
    }

    resolve(): (req, res, next) => void {
        return (req, res, next) => {
            res.header('Access-Control-Allow-Origin', "*");
            // setTimeout(() => {
            //     const json = {
            //         code: -1,
            //         msg: 'time out',
            //     };
            //     res.send(JSON.stringify(json));
            //     res.end();
            // }, 4000)
            const msg: string = this.fiterData(req.query, req.path); 
            if (msg) {
                const json = {
                    code: -1,
                    msg,
                };
                res.send(JSON.stringify(json));
                res.end();
            } else {
                next();
            }
        }
    }
}