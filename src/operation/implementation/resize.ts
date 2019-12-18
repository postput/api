import {Readable} from "stream";
import sharp = require("sharp");
import {BaseOperation} from "../model";

export default class ResizeOperation extends BaseOperation{
    
    getTypes(): string[] {
        return ['resize', 'resizes', 'rs'];
    }
    
    async apply(readable: Readable): Promise<Readable> {
        const value = this.value.toString();
        
        const values = value.split(',').map(val => parseInt(val));

        const sharpFilter = sharp().resize(...values);
        sharpFilter.on('info', (info) =>{
            this.response.setHeader('X-width', info.width);
            this.response.setHeader('X-height', info.height);
            this.response.setHeader('Content-Length', info.size);
        });
        return readable.pipe(sharpFilter);
    }
    
}