import {BaseOperation} from "../model";
import {Readable} from "stream";
import sharp = require("sharp");

export default class BlurOperation extends BaseOperation{
    
    getTypes(): string[] {
        return ['blur', 'blurred'];
    }
    
    async apply(readable: Readable): Promise<Readable> {
        const sharpFilter = sharp().blur(this.value);
        sharpFilter.on('info', (info) =>{
            this.response.setHeader('Content-Length', info.size);
        });
        return readable.pipe(sharpFilter);
    }
}