import {Provider, ProviderConfig, ProviderInstance} from '../model'
import {Download} from "../../download/model";
import {Upload} from "../../upload/model";
import {merge} from 'lodash';
import {Boom} from '@hapi/boom'
import {resolve} from "url";
import * as request from "request";

export default class WebfolderProvider implements Provider{

    static type = 'webfolder';

    instance: ProviderInstance;
    defaultConfig: ProviderConfig = {
        allowUpload : true,
        maxUploadSize: undefined,
        urls: ['http://www.example.com/'],
        custom: {
            "method": "GET",
            "uri": "https://cdn-storage.speaky.com",
            "qs": {
                "resize-width": 640,
                "resize-height": 640
            }
        }
    };

    public constructor(storage: ProviderInstance){
        this.instance = storage;
        storage.config = merge(this.defaultConfig, storage.config)
    }

    async init(): Promise<void> {
        return;
    }

    async delete(req, res): Promise<void> {
        throw Boom.notImplemented()
    }

    async download(req, res): Promise<Download> {
        const file = req.path.substr(req.path.indexOf('/',1));
        const customConfig = this.instance.config.custom;

        if(req.query){
            customConfig.qs = customConfig.qs || {};
            customConfig.qs = merge(customConfig.qs, req.query);
        }
        customConfig.uri  = resolve(customConfig.uri, file);
        customConfig.resolveWithFullResponse= true;
        const download = new Download();
        download.data = await request(customConfig);
        return download;
    }

    async upload(req, res): Promise<Upload[]> {
        throw Boom.notImplemented()
    }

}