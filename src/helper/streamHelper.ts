import appConfig from "../config/app";
import {Readable} from "stream";

export class StreamHelper{
    
    static fromBuffer(buffer) : Readable{
        var stream = new Readable();
        stream.push(buffer);
        stream.push(null);
        return stream;
    }

    static async toBuffer(stream){
        let buffer = [];
        return new Promise<any>((resolve, reject) => {
            stream.on("data", dataChunk => {
                buffer.push(dataChunk);
            });
            stream.on("end", () => {
                resolve(Buffer.concat(buffer));
            });
            stream.on("error", (err) => {
                reject(err);
            });
        });
    }
}
