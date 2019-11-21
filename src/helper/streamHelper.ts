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
        for await (let chunk of stream) {
            buffer.push(chunk);
        }
        return Buffer.concat(buffer);
    }
}
