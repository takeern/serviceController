import { Injectable } from '@nestjs/common';
import { Transport, ClientProxyFactory } from '@nestjs/microservices';

interface Iconfig {
	bookName?: string;
	bookNumber?: string;
	bookHref?: string;
}

@Injectable()
export class AppService {
    public client: any;
    constructor() {
        this.client = ClientProxyFactory.create({
		transport: Transport.TCP,
			options: {
				port: 5000,
			},
		});
    }

    async onModuleInit() {
		try {
			const m = await this.client.connect();
			console.log(m);
		} catch(e) {
			console.log(e)
		}
    }

	getHello(): string {
		return Injectable.toString();
	}

	getBookNumber(config: Iconfig){
		const pattern = { cmd: 'spider' };
		const payload =  {
			type: 'getBookNumber',
    		playload: {
				bookName: config.bookName || '大道朝天'
			},
		};
		const k = this.client.send(pattern, payload);
		return k;
	}

	getBookList(config: Iconfig) {
		const pattern = { cmd: 'spider' };
		if (!config.bookName && !config.bookNumber) {
			return {
				msg: `bookName , bookNumber 至少上传一个`
			}
		}
		const payload =  {
			type: 'getBookList',
    		playload: {
				bookName: config.bookName || '大道朝天',
				bookNumber: config.bookNumber
			},
		};
		const k = this.client.send(pattern, payload);
		return k;
	}

	getBookData(config: Iconfig) {
		const pattern = { cmd: 'spider' };
		if (!config.bookName && !config.bookNumber) {
			return {
				msg: `bookName , bookNumber 至少上传一个`
			}
		}
		if (!config.bookHref) {
			return {
				msg: `bookHref 必须传`
			}
		}
		const payload =  {
			type: 'getBookData',
    		playload: {
				bookName: config.bookName || '大道朝天',
				bookNumber: config.bookNumber,
				bookHref: config.bookHref
			},
		};
		const k = this.client.send(pattern, payload);
		return k;
	}

	getBookAllData(config: Iconfig) {
		const pattern = { cmd: 'spider' };
		const payload =  {
			type: 'getBookAllData',
    		playload: {
				bookName: config.bookName || '大道朝天',
				bookNumber: config.bookNumber
			},
		};
		const k = this.client.send(pattern, payload);
		return k;
	}
}
