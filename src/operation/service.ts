import {forOwn} from 'lodash';
import {Async} from "../helper/async";
import {tmpdir} from 'os';
import "isomorphic-fetch"
//import  * as cv from 'opencv';
import {join} from 'path';
// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
import {StreamHelper} from "../helper/streamHelper";
import * as ffmpeg from 'fluent-ffmpeg'
import {error} from "winston";
import {createReadStream, createWriteStream, unlink, writeFileSync, writeSync, writevSync} from "fs";
import Logger from "../logger";
import {PassThrough, Writable} from "stream";
import sharp = require("sharp");
import {Download} from "../download/model";
import * as fileType from "file-type";
import {FormHelper} from "../helper/form";
import {FFMPEGHelper} from "../helper/ffmpegHelper";

const readChunk = require('read-chunk');
const { Converter } = require('ffmpeg-stream');

const { spawn } = require('child_process');


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

    async applyOperations(download, req, res){
        const operations = [];

        forOwn(req.query, (value, key)=> {
            operations.push({key, value});
        });

        if(operations.length > 0 && false){
            download.data = download.data.pipe(sharp());
        }

        await Async.foreach(operations, async operation => {
            const transformation = await this.applyOperation(operation, req, download, res);
            if(transformation !== null){
                download.data = transformation;
            }
        });
        return download;
    }

    async applyOperation(operation, req, download: Download, res){

        let buffer;
        let value = operation.value;
        let sharpFilter;
        let ft;
        let values;
        let metadata;

        switch (operation.key) {
            case 'rotate':
                sharpFilter = sharp().rotate(value);
                sharpFilter.on('info', (info) =>{
                    res.setHeader('X-width', info.width);
                    res.setHeader('X-height', info.height);
                    res.setHeader('content-length', info.size);
                });
                return download.data.pipe(sharpFilter);
                break;
            case 'blur':
                sharpFilter = sharp().blur(value);
                sharpFilter.on('info', (info) =>{
                    res.setHeader('content-length', info.size);
                });
                return download.data.pipe(sharpFilter);
                break;
            case 'brightness':
                sharpFilter = sharp().modulate({brightness: value}
                );
                sharpFilter.on('info', (info) =>{
                    res.setHeader('content-length', info.size);
                });
                return download.data.pipe(sharpFilter);
                break;
            case 'saturation':
                sharpFilter = sharp().modulate({saturation: value}
                );
                sharpFilter.on('info', (info) =>{
                    res.setHeader('content-length', info.size);
                });
                return download.data.pipe(sharpFilter);
                break;
            case 'hue':
                sharpFilter = sharp().modulate({hue: value}
                );
                sharpFilter.on('info', (info) =>{
                    res.setHeader('content-length', info.size);
                });
                return download.data.pipe(sharpFilter);
                break;
            case 'flip-y':
                sharpFilter = sharp().flip(value);
                sharpFilter.on('info', (info) =>{
                    res.setHeader('content-length', info.size);
                });
                return download.data.pipe(sharpFilter);
                break;
            case 'flip-x':
                sharpFilter = sharp().flop(value);
                sharpFilter.on('info', (info) =>{
                    res.setHeader('content-length', info.size);
                });
                return download.data.pipe(sharpFilter);
                break;
            case 'negate':
                sharpFilter = sharp().negate();
                sharpFilter.on('info', (info) =>{
                    res.setHeader('content-length', info.size);
                });
                return download.data.pipe(sharpFilter);
                break;
            case 'gamma':
                sharpFilter = sharp().gamma(value);
                sharpFilter.on('info', (info) =>{
                    res.setHeader('content-length', info.size);
                });
                return download.data.pipe(sharpFilter);
                break;
            case 'crop':
                const cropLeft = req.query['crop-left'] || 0;
                const cropTop = req.query['crop-top'] || 0;
                const cropWidth = req.query['crop-width'] || 0;
                const cropHeight = req.query['crop-height'] || 0;
                sharpFilter = sharp().extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight });
                sharpFilter.on('info', (info) =>{
                    res.setHeader('content-length', info.size);
                });
                return download.data.pipe(sharpFilter);
                break;
            case 'mask':

                switch(value) {
                    case 'elipse' :
                        buffer = await StreamHelper.toBuffer(download.data);

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

                        sharpFilter.on('info', (info) =>{
                            res.setHeader('content-length', info.size);
                        });
                        return download.data.pipe(sharpFilter);
                        break;
                    case 'corner' :
                        buffer = await StreamHelper.toBuffer(download.data);
                        metadata = await sharp(buffer).metadata();
                        const radius = req.query['corner-radius'] || metadata.width/10 ;
                        const corner = Buffer.from(
                            '<svg><rect x="0" y="0" width="'+ metadata.width +'" height="'+ metadata.height +'"  rx="'+ radius +'" ry="'+ radius +'"/></svg>'
                        );

                        sharpFilter = sharp(buffer).composite([{
                            input: corner,
                            //@ts-ignore
                            blend: 'dest-in',
                            cutout: true
                        }]).webp();

                        sharpFilter.on('info', (info) =>{
                            res.setHeader('content-length', info.size);
                        });
                        return download.data.pipe(sharpFilter);
                        break;
                }



                break;
            case 'format':

                const rawFormatOptions = req.query.formatOptions || '{}';
                const formatOptions = JSON.parse(rawFormatOptions);

                switch(value) {
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
                    res.setHeader('content-length', info.size);
                });
                return download.data.pipe(sharpFilter);
                break;

            case 'resize':
                value = value.toString();
                values = value.split(',').map(val => parseInt(val));

                sharpFilter = sharp().resize(...values);
                sharpFilter.on('info', (info) =>{
                    res.setHeader('X-width', info.width);
                    res.setHeader('X-height', info.height);
                    res.setHeader('content-length', info.size);
                });
                return download.data.pipe(sharpFilter);
                break;
            case 'resize-video':
                value = value.toString();
                values = value.split(',').map(val => parseInt(val));
                buffer = await StreamHelper.toBuffer(download.data);
                ft = FormHelper.guessFileType(buffer, req.path);
                return FFMPEGHelper.resize(buffer, ft.ext, {resize : value}, res);
                break;
            case 'crop-video':
                value = value.toString();
                values = value.split(',').map(val => parseInt(val));
                buffer = await StreamHelper.toBuffer(download.data);
                ft = FormHelper.guessFileType(buffer, req.path);
                return FFMPEGHelper.crop(buffer, ft.ext, {crop : value}, res);
                break;
            case 'extract':
                value = value.toString();
                let extractValues = value.split(',').map(val => parseInt(val));
                buffer = await StreamHelper.toBuffer(download.data);
                ft = FormHelper.guessFileType(buffer, req.path);
                return FFMPEGHelper.extract(buffer, ft.ext, {start : extractValues[0], duration: extractValues[1]}, res);
                break;
            case 'face':
                const tmp = tmpdir() +'/'+ uuid();
                buffer = await download.data.toBuffer();
                return download.data.pipe(this.detectFaces(buffer));
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
