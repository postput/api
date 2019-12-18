import {BaseOperation} from "../model";
import {Readable} from "stream";
import sharp = require("sharp");


export default class FlipYOperation extends BaseOperation{

    getTypes(): string[] {
        return ['flipy', 'flip-y', 'flips-y', 'flipsy'];
    }

    async apply(readable: Readable): Promise<Readable> {

        const sharpFilter = sharp().flip(this.value);
        sharpFilter.on('info', (info) =>{
            this.response.setHeader('Content-Length', info.size);
        });
        return readable.pipe(sharpFilter);
    }
}
