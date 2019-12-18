import {StreamHelper} from "../../helper/streamHelper";
import {BaseOperation} from "../model";
import {Readable} from "stream";
import sharp = require("sharp");

export default class MaskOperation extends BaseOperation{

    getTypes(): string[] {
        return ['mask', 'masks'];
    }

    async apply(readable: Readable): Promise<Readable> {
        
        let buffer, metadata, sharpFilter;
        
        switch(this.value) {
            case 'elipse' :
                buffer = await StreamHelper.toBuffer(readable);
                metadata = await sharp(buffer).metadata();
                const elipse = Buffer.from(
                    '<svg><rect x="0" y="0" width="'+ metadata.width +'" height="'+ metadata.height +'" rx="'+ metadata.width/2 +'" ry="'+ metadata.height/2 +'"/></svg>'
                );
                sharpFilter = sharp(buffer).composite([{
                    input: elipse,
                    //@ts-ignore
                    blend: 'dest-in',
                    cutout: true
                }]).webp();
                break;
            case 'corner' :
                buffer = await StreamHelper.toBuffer(readable);
                metadata = await sharp(buffer).metadata();
                const radius = this.request.query['corner-radius'] || metadata.width/10 ;
                const corner = Buffer.from(
                    '<svg><rect x="0" y="0" width="'+ metadata.width +'" height="'+ metadata.height +'"  rx="'+ radius +'" ry="'+ radius +'"/></svg>'
                );
                sharpFilter = sharp(buffer).composite([{
                    input: corner,
                    //@ts-ignore
                    blend: 'dest-in',
                    cutout: true
                }]).webp();
                break;
        }
        sharpFilter.on('info', (info) =>{
            this.response.setHeader('Content-Length', info.size);
        });
        
        return readable.pipe(sharpFilter);
    }
}

