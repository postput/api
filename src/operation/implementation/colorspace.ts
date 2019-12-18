import {BaseOperation} from "../model";
import {Readable} from "stream";
import sharp = require("sharp");

export default class BrightenOperation extends BaseOperation{

    getTypes(): string[] {
        return ['colorSpace', 'colourSpace', 'colourspace', 'colorspace'];
    }

    async apply(readable: Readable): Promise<Readable> {
        const sharpFilter = sharp().toColorspace(this.value);
        sharpFilter.on('info', (info) =>{
            this.response.setHeader('Content-Length', info.size);
        });
        return readable.pipe(sharpFilter);
    }
}