import {forOwn} from 'lodash';
import {Async} from "../helper/async";
import {tmpdir} from 'os';
import "isomorphic-fetch"
//import  * as cv from 'opencv';
import {join} from 'path';
// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
import {StreamHelper} from "../helper/streamHelper";
import sharp = require("sharp");

const uuid = require('uuid/v4');

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement, additionally an implementation
// of ImageData is required, in case you want to use the MTCNN
export class OperationService {

    private static pInstance: OperationService;

    static get instance(): OperationService {
        return OperationService.getInstance();
    }

    private static getInstance() {
        if (!OperationService.pInstance) {
            OperationService.pInstance = new OperationService();
        }
        return OperationService.pInstance;
    }

    async applyOperations(stream, query){
        const operations = [];

        forOwn(query, (value, key)=> {
            operations.push({key, value});
        });

        if(operations.length > 0){
            stream = stream.pipe(sharp());
        }
        await Async.foreach(operations, async operation => {
            const transformation = await this.applyOperation(operation, query, stream);
            if(transformation !== null){
                stream = stream.pipe(transformation);
            }
        });
        return stream;
    }

    async applyOperation(operation, query, stream: any){

        let buffer;
        let value = operation.value || undefined;
        switch (operation.key) {
            case 'rotate':
                return sharp().rotate(value);
                break;
            case 'blur':
                return sharp().blur(value);
                break;
            case 'mask':

                switch(value) {
                    case 'elipse' :

                        buffer = await stream.toBuffer();
                        const metadata = await sharp(buffer).metadata();
                        const roundedCorners = Buffer.from(
                            '<svg><rect x="0" y="0" width="'+ metadata.width +'" height="'+ metadata.height +'" rx="'+ metadata.width/2 +'" ry="'+ metadata.height/2 +'"/></svg>'
                        );
                        return sharp().composite([{
                            input: roundedCorners,
                            //@ts-ignore
                            blend: 'dest-in',
                            cutout: true
                        }]).webp();
                        break;
                }



                break;
            case 'format':

                const rawFormatOptions = query.formatOptions || '{}';
                const formatOptions = JSON.parse(rawFormatOptions);

                switch(value) {
                    case 'webp' :
                        return sharp().webp(formatOptions);
                        break;
                    case 'jpeg' :
                        return sharp().jpeg(formatOptions);
                        break;
                    case 'jpg' :
                        return sharp().jpeg(formatOptions);
                        break;
                    case 'png' :
                        return sharp().png(formatOptions);
                        break;
                    case 'tiff' :
                        return sharp().tiff(formatOptions);
                        break;
                    case 'raw' :
                        return sharp().raw();
                        break;
                }

                const webPQuality = parseInt(query.webPQuality);

            case 'resize':
                value = value.toString();
                let values = value.split(',').map(val => parseInt(val));
                //@ts-ignore
                return sharp().resize(...values);
                break;
            case 'face':
                const tmp = tmpdir() +'/'+ uuid();
                buffer = await stream.toBuffer();
                return this.detectFaces(buffer);
                break;
                // .webp({ lossless: true })


        }
        return null;
    }

    async detectFaces(buffer){
        const cv : any = {};
        return new Promise((resolve, reject) => {
            cv.readImage(buffer, async (err, im)=>{
                im.convertGrayscale();
                const file = join(__dirname, '/../../haar', 'haarcascade_profileface.xml');
                im.detectObject(file, {}, (err, faces) => {
                    for (var i=0;i<faces.length; i++){
                        var x = faces[i];
                        im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
                    }

                    const b2 = im.toBuffer();
                    const s2 = StreamHelper.fromBuffer(b2);
                    resolve(s2.pipe(sharp()));
                });
            });
        });
    }

}
