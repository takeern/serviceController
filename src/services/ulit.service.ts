import { Injectable } from '@nestjs/common';
const pako = require('pako');

interface IDeflateOption {
    level?: number;
    windowBits?: number;
    memLevel?: number;
    strategy?: number;
    dictionary?: number;
}

@Injectable()
export class UlitService {
    pako: any;
    constructor() {
        this.pako = pako;
    }
    deflate (bu:Buffer, option?: IDeflateOption): Buffer {
        const op = Object.assign({}, {
            level: 3,
        }, option);
        return pako.deflate(bu, op);
    }
}