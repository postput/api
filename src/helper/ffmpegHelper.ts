import {Readable} from "stream";
import {join} from "path";
import {tmpdir} from "os";
import {v4} from 'uuid'
import {StreamHelper} from "./streamHelper";
import {FormHelper} from "./form";
import {createReadStream, statSync, unlink, writeFileSync} from "fs";
import * as ffmpeg from "fluent-ffmpeg";
import Logger from "../logger";

export class FFMPEGHelper{

    static async run(buffer, extension, res, fct){
        const identifier = v4();
        let inputIdentifier = join(tmpdir(), identifier + '-input.'+ extension);
        let outputIdentifier = join(tmpdir(), identifier + '-output.'+ extension);
        writeFileSync(inputIdentifier, buffer);
        return new Promise<any>(async (resolve, reject) => {
            let ffmpegRunnable = ffmpeg(inputIdentifier);
            ffmpegRunnable = fct(ffmpegRunnable);
            ffmpegRunnable = ffmpegRunnable.output(outputIdentifier);
            ffmpegRunnable
                .on('error', function(err) {
                    unlink(inputIdentifier, Logger.error);
                    reject(err);
                })
                .on('progress', function(progress) {
                    console.log('Processing: ' + progress.percent + '% done');
                })
                .on('end', function(a) {
                    unlink(inputIdentifier, Logger.error);
                    const stat = statSync(outputIdentifier);

                    res.setHeader('Content-Length', stat.size);
                    const modifiedReadStream = createReadStream(outputIdentifier);
                    modifiedReadStream.on('start', data => {
                        console.log(data);
                    });
                    modifiedReadStream.on('end',(data)=>{
                        unlink(outputIdentifier, Logger.error);
                    });
                    resolve(modifiedReadStream);
                });
            ffmpegRunnable.run();
        });
    }

    static async extract(buffer, extension, params, res){
        return this.run(buffer, extension, res, (runnable) => {
            runnable = runnable.seek(params.start);
            if(params.duration){
                runnable = runnable.duration(params.duration);
            }
            return runnable;
        });
    }


    
    static async resize(buffer, extension, params, res){
        return this.run(buffer, extension, res, (runnable) => {
            runnable = runnable.size(params.resize);
            return runnable;
        });
    }

    static async crop(buffer, extension, params, res){
        return this.run(buffer, extension, res, (runnable) => {
            runnable = runnable.outputOptions('-filter:v:0 crop='+ params.crop);
            return runnable;
        });
    }
    
}