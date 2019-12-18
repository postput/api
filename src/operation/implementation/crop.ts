import {BaseOperation} from "../model";
import {Readable} from "stream";
import sharp = require("sharp");

export default class CropOperation extends BaseOperation{

    getTypes(): string[] {
        return ['crop', 'crops', 'cropped'];
    }

    async apply(readable: Readable): Promise<Readable> {

        const cropLeft = this.request.query['crop-left'] || 0;
        const cropTop = this.request.query['crop-top'] || 0;
        const cropWidth = this.request.query['crop-width'] || 0;
        const cropHeight = this.request.query['crop-height'] || 0;
        const sharpFilter = sharp().extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight });
        sharpFilter.on('info', (info) =>{
            this.response.setHeader('Content-Length', info.size);
        });
        return readable.pipe(sharpFilter);
    }
}