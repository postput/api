import {BaseOperation} from "../model";
import {Readable} from "stream";
import sharp = require("sharp");

export default class BrightenOperation extends BaseOperation{

    getTypes(): string[] {
        return ['brighten', 'brightness'];
    }

    async apply(readable: Readable): Promise<Readable> {
        const sharpFilter = sharp().modulate({brightness: this.value});
        sharpFilter.on('info', (info) =>{
            this.response.setHeader('Content-Length', info.size);
        });
        return readable.pipe(sharpFilter);
    }
}