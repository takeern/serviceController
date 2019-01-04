import { Middleware, NestMiddleware } from '@nestjs/common';

@Middleware()
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
            case ('/getBookList'): {
                if (!data.bookName && !data.bookNumber) {
                    msg = 'bookName,bookNumber is undefined';
                }
                break;
            }
            case ('/getBookData'): {
                if (!data.bookName && !data.bookNumber) {
                    msg = 'bookName,bookNumber is undefined';
                }
                if (!data.bookHref) {
                    msg = 'bookHref is undefined';
                }
                break;
            }
            default: {
                break;
            }
        }
        return msg;
    }

    resolve(): (req, res, next) => void {
        return (req, res, next) => {
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