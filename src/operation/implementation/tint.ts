import {BaseOperation} from "../model";
import {Readable} from "stream";
import sharp = require("sharp");

export default class TintOperation extends BaseOperation{

    getTypes(): string[] {
        return ['tint', 'tints', 'colorize', 'colourise'];
    }

    async apply(readable: Readable): Promise<Readable> {
        const values = this.value.split(',').map(val => {
            const v = parseFloat(val) || 0;
            return v;
        } );
        const sharpFilter = sharp().tint({r:values[0] || 0, g: values[1] || 0, b: values[2]|| 0, alpha: values[3] || 0 });
        sharpFilter.on('info', (info) =>{
            this.response.setHeader('Content-Length', info.size);
        });
        return readable.pipe(sharpFilter);
        
    }

}

