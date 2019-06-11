import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
  } from '@nestjs/websockets';
import { ProxyService } from './bookProxy.service';
import { UlitService } from './ulit.service';

const iconv = require('iconv-lite');

interface IData {
    type: string;
    bookData: any;
}

@WebSocketGateway(4536)
export class DownloadService {
    constructor(
        private readonly SpiderService: ProxyService,
        private readonly UlitService: UlitService,
    ) {
    }
    @WebSocketServer() server;
    private wsDataWrapper(type: string, data?: any) {
        return this.UlitService.deflate(new Buffer(JSON.stringify({
            type,
            data,
        })));
    }

    @SubscribeMessage('downloadBook')
    async onEvent(client, data): Promise<any>{
        const bookNumber = data.bookNumber;
        if(bookNumber) {
            const { bookList } = await this.SpiderService.getBookList({ bookNumber }) as any;
            client.send(this.wsDataWrapper('bookTable', bookList));
            let sum = 0; // buffer 长度
            const k = this.SpiderService.getBookAllData({ bookNumber });
            const listState = new Array(bookList.length).fill(0);
            let stash = '';
            let lastIndex: number = 0;
            let timeId = null;
            let books = [];
            k.subscribe({
                next: (v: IData) => {
                    console.log(v)
                    const { bookData } = v;
                    console.log(bookData.length);
                    sum += bookData.length;
                    const book: Array<any> = [];
                    const tableIndex = []; // 章节索引
                    let str = iconv.decode(bookData, 'gbk');
                    if (str.length === 0) {
                        return;
                    }
                    str = stash + str;
                    stash = '';
                    let overoffset = 0;

                    for (let i = lastIndex; i < bookList.length; i++) {
                        const offsetIndex: number = i === lastIndex ? 0 : tableIndex[tableIndex.length - 1].offset;
                        const offset = str.indexOf(bookList[i].title, offsetIndex);
                        if (offset === -1) {
                            break;
                        }
                        tableIndex.push({
                            offset,
                            title: bookList[i].title,
                            webLen: bookList[i].length,
                        });
                    }

                    for (let i = 0; i < tableIndex.length; i++) {
                        if (i === 0) {
                            continue;
                        }
                        const lastOffset = tableIndex[i - 1].offset;
                        const nowOffset = tableIndex[i].offset;
                        const tableData = str.slice(lastOffset, nowOffset).replace(/(\r\n\r\n)/g, '<br />');;
                        const tableLen = nowOffset - lastOffset;
                        const tableOffset = i + lastIndex - 1;
                        listState[tableOffset] = 1;
                        book.push({
                            title: tableIndex[i - 1].title,
                            tableLen,
                            webLen: tableIndex[i - 1].webLen,
                            tableOffset,
                            tableData,
                        });
                    }

                    if (tableIndex.length !== 0) {
                        overoffset = tableIndex[tableIndex.length - 1].offset;
                        const lastStr = str.slice(overoffset);
                        stash += lastStr;
                        lastIndex = lastIndex + tableIndex.length - 1;
                    }
                    if (book.length !== 0) {
                        books.push(book);
                    }

                    if (!timeId) {
                        timeId = setInterval(() => {
                            if (books.length !== 0) {
                                console.log('send');
                                books = Array.prototype.concat.apply([], books);
                                client.send(this.wsDataWrapper('bookData', books));
                                books.length = 0;
                            }
                        }, 1000)
                    }
                    
                },
                error: (err) => console.log(err),
                complete: () => {
                    const len = listState.findIndex(i => i === 0);
                    const book = [];
                    book.push({
                        title: bookList[len].title,
                        webLen: bookList[len].length,
                        tableOffset: len,
                        tableData: stash,
                        tableLen: stash.length,
                    });
                    clearInterval(timeId);
                    client.send(this.wsDataWrapper('bookData', book));
                    client.send(this.wsDataWrapper('bookState', listState));
                    console.log(sum);
                    console.log('done');
                },
            })
        }
    }
}

