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

    static async extract(buffer, extension, params, res){
        const identifier = v4();
        let inputIdentifier = join(tmpdir(), identifier + '-input.'+ extension);
        let outputIdentifier = join(tmpdir(), identifier + '-output.'+ extension);
        writeFileSync(inputIdentifier, buffer);
        return new Promise<any>(async (resolve, reject) => {
            let ffmpegRunnable = ffmpeg(inputIdentifier);
            ffmpegRunnable = ffmpegRunnable.seek(params.start);
            if(params.duration){
                ffmpegRunnable = ffmpegRunnable.duration(params.duration);
            }
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

                    res.setHeader('content-length', stat.size);
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

}