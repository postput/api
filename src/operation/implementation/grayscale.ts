import {BaseOperation} from "../model";
import {Readable} from "stream";
import sharp = require("sharp");

export default class GrayscaleOperation extends BaseOperation{

    getTypes(): string[] {
        return ['grayscale', 'greyscale'];
    }

    async apply(readable: Readable): Promise<Readable> {
        const sharpFilter = sharp().grayscale(this.value);
        sharpFilter.on('info', (info) =>{
            this.response.setHeader('Content-Length', info.size);
        });
        return readable.pipe(sharpFilter);
    }
}


