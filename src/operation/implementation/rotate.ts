import {BaseOperation} from "../model";
import {Readable} from "stream";
import sharp = require("sharp");

export default class RotateOperation extends BaseOperation{

    getTypes(): string[] {
        return ['rotate', 'rt', 'rotates'];
    }

    async apply(readable: Readable): Promise<Readable> {
        const sharpFilter = sharp().rotate(this.value);
        sharpFilter.on('info', (info) =>{
            this.response.setHeader('X-width', info.width);
            this.response.setHeader('X-height', info.height);
            this.response.setHeader('Content-Length', info.size);
        });
        return readable.pipe(sharpFilter);
    }

}