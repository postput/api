import {Readable} from "stream";
import {Storage} from "../storage/model";
import {Upload} from "../upload/model";
import {resolve} from 'url';
import {join} from 'path';

export class URLHelper{

    static getUrls(storage: Storage, upload: Upload) : string[] {
        return storage.config.urls.map(url => {
            return resolve(url, join(storage.name, upload.fileName));
        });
    }
    
}