import {BaseOperation} from "../model";
import {Readable} from "stream";
import sharp = require("sharp");

export default class SaturateOperation extends BaseOperation{

    getTypes(): string[] {
        return ['saturate', 'saturates', 'saturation'];
    }

    async apply(readable: Readable): Promise<Readable> {
        const sharpFilter = sharp().modulate({saturation: this.value}
        );
        sharpFilter.on('info', (info) =>{
            this.response.setHeader('Content-Length', info.size);
        });
        return readable.pipe(sharpFilter);
    }

}



