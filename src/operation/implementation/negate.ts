import {BaseOperation} from "../model";
import {Readable} from "stream";
import sharp = require("sharp");

export default class NegateOperation extends BaseOperation{

    getTypes(): string[] {
        return ['negate', 'negates', 'negative'];
    }

    async apply(readable: Readable): Promise<Readable> {
        const sharpFilter = sharp().negate(this.value);
        sharpFilter.on('info', (info) =>{
            this.response.setHeader('Content-Length', info.size);
        });
        return readable.pipe(sharpFilter);
    }
}