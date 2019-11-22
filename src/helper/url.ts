import {Readable} from "stream";
import {Storage} from "../storage/model";
import {Upload} from "../upload/model";
import {resolve} from 'url';
import {join} from 'path';
import appConfig from "../config/app";

export class URLHelper{

    static getUrls(storage: Storage, upload: Upload) : string[] {
        const urls = storage.config.urls.concat(appConfig.urls);
        const uniqueUrls = [...new Set<string>(urls)];
        return uniqueUrls.map(url => {
            return resolve(url, join(storage.name, upload.fileName));
        });
    }
    
}