import { Injectable } from '@nestjs/common';
import { Transport, ClientProxyFactory, GrpcMethod } from '@nestjs/microservices';

interface Iconfig {
	bookName?: string;
	bookNumber?: string;
	bookHref?: string;
}


@Injectable()
export class SpiderService {
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
		return new Promise((reslove, reject) => {
			k.subscribe({
				next: (v) => {
					const data = JSON.parse(String.fromCharCode.apply(null, v));
					reslove(data);
				},
				error: (err) => reject(err),
			})
		});
	}

	getBookList(config: Iconfig) {
		const pattern = { cmd: 'spider' };
		const payload =  {
			type: 'getBookList',
    		playload: {
				bookNumber: config.bookNumber
			},
		};
		console.log(payload);
		const k = this.client.send(pattern, payload);
		return new Promise((reslove, reject) => {
			k.subscribe({
				next: (v: any) => {
					const data = JSON.parse(String.fromCharCode.apply(null, v));
					reslove(data);
				},
				error: (err) => {
					reslove(null);
				},
			})
		});
	}

	getBookData(config: Iconfig) {
		const pattern = { cmd: 'spider' };
		const payload =  {
			type: 'getBookData',
    		playload: {
				bookName: config.bookName || '大道朝天',
				bookNumber: config.bookNumber,
				bookHref: config.bookHref
			},
		};
		const k = this.client.send(pattern, payload);
		return new Promise((reslove, reject) => {
			k.subscribe({
				next: (v: any) => {
					v.bookData = String.fromCharCode.apply(null, v.bookData);
					reslove(v);
				},
				error: (err) => reject(err),
			})
		});
	}

	getBookAllData(config: Iconfig, bookList) {
		const pattern = { cmd: 'spider' };
		const payload =  {
			type: 'getBookAllData',
			playload: {
				bookNumber: config.bookNumber,
				bookList,
			},
		};
		const k = this.client.send(pattern, payload);
		return k;
	}
}