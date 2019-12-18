import {BaseOperation} from "../model";
import {Readable} from "stream";
import sharp = require("sharp");


export default class FlipXOperation extends BaseOperation{

    getTypes(): string[] {
        return ['flipx', 'flip-x', 'flips-x', 'flipsx'];
    }

    async apply(readable: Readable): Promise<Readable> {

        const sharpFilter = sharp().flop(this.value);
        sharpFilter.on('info', (info) =>{
            this.response.setHeader('Content-Length', info.size);
        });
        return readable.pipe(sharpFilter);
    }
}


