import {BaseOperation} from "../model";
import {Readable} from "stream";
import sharp = require("sharp");

export default class HueOperation extends BaseOperation{

    getTypes(): string[] {
        return ['hue'];
    }

    async apply(readable: Readable): Promise<Readable> {
        const sharpFilter = sharp().modulate({hue: this.value});
        sharpFilter.on('info', (info) =>{
            this.response.setHeader('Content-Length', info.size);
        });
        return readable.pipe(sharpFilter);
    }
}