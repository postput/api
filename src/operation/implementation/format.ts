import {BaseOperation} from "../model";
import {Readable} from "stream";
import sharp = require("sharp");


export default class FormatOperation extends BaseOperation{

    getTypes(): string[] {
        return ['format', 'formats', 'convert', 'converts'];
    }

    async apply(readable: Readable): Promise<Readable> {

        const rawFormatOptions = this.request.query.formatOptions || '{}';
        const formatOptions = JSON.parse(rawFormatOptions);
        let sharpFilter;
        
        switch(this.value) {
            case 'webp' :
                sharpFilter = sharp().webp(formatOptions);
                break;
            case 'jpeg' :
                sharpFilter = sharp().jpeg(formatOptions);
                break;
            case 'jpg' :
                sharpFilter = sharp().jpeg(formatOptions);
                break;
            case 'png' :
                sharpFilter = sharp().png(formatOptions);
                break;
            case 'tiff' :
                sharpFilter = sharp().tiff(formatOptions);
                break;
            case 'raw' :
                sharpFilter = sharp().raw();
                break;
        }
        sharpFilter.on('info', (info) =>{
            this.response.setHeader('Content-Length', info.size);
        });
        return readable.pipe(sharpFilter);
        
    }
}




