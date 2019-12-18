import {BaseOperation} from "../model";
import {Readable} from "stream";
import {join} from 'path'
import * as canvas from 'canvas';
import * as faceapi from 'face-api.js';
import {StreamHelper} from "../../helper/streamHelper";
import CropOperation from "./crop";

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
const { Canvas, Image, ImageData } = canvas;
//@ts-ignore
faceapi.env.monkeyPatch({
        //@ts-ignore
        Canvas: Canvas,
        //@ts-ignore
        Image: Image,
        ImageData: ImageData
}
    );

export default class FaceOperation extends BaseOperation{

    getTypes(): string[] {
        return ['face', 'faces'];
    }

    async apply(readable: Readable): Promise<Readable> {
        const buffer = await StreamHelper.toBuffer(readable);
        const img = await canvas.loadImage(buffer);
        //@ts-ignore
        const face = await faceapi.detectSingleFace(img);
        if(!face) return StreamHelper.fromBuffer(buffer);

        let facePad = this.request.query['face-pad'] || 1.5;
        facePad = parseFloat(facePad);
        facePad = Math.max(facePad, 1);
        //@ts-ignore
        const left = Math.max(parseInt(face.box.topLeft.x - (face.box.width * (facePad - 1))), 0);
        //@ts-ignore
        const top = Math.max(parseInt(face.box.topLeft.y - (face.box.height * (facePad - 1))), 0);
        //@ts-ignore
        let width = parseInt(face.box.width + face.box.width * (facePad - 1 ) * 2);
        //@ts-ignore
        let height = parseInt(face.box.height + face.box.height * (facePad - 1 ) * 2 );
        //@ts-ignore
        width = Math.min(parseInt(Math.max(face.imageDims.width - left, 0)), width);
        //@ts-ignore
        height = Math.min(parseInt(Math.max(face.imageDims.height - top, 0)), height);

        this.response.setHeader('X-Face-left', left);
        this.response.setHeader('X-Face-Top', top);
        this.response.setHeader('X-Face-Width', width);
        this.response.setHeader('X-Face-Height', height);

        this.request.query['crop'] = true;
        this.request.query['crop-left'] = left;
        this.request.query['crop-top'] = top;
        this.request.query['crop-width'] = width;
        this.request.query['crop-height'] = height;

        const cropOperation = new CropOperation(this.request, this.response);
        return cropOperation.apply(StreamHelper.fromBuffer(buffer));
    }
}