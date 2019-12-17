import {ProviderInstance} from "../model";
import {Download} from "../../download/model";
import {resolve} from "url";
import * as request from "request";
import {Upload} from "../../upload/model";
import {Boom} from '@hapi/boom'
import {merge, isEmpty} from 'lodash';
import {Provider, ProviderConfig} from "../interface";

export default class ProxyProvider implements Provider{

    instance: ProviderInstance;
    defaultConfig: ProviderConfig = {
        allowUpload : true,
        maxUploadSize: undefined,
        urls: ['http://www.example.com/'],
        custom: {
            allowedHosts: ["storage.speaky.com"]
        }
    };

    public constructor(storage: ProviderInstance){
        this.instance = storage;
        storage.config = merge(this.defaultConfig, storage.config)
    }

    getType(){
        return 'proxy';
    }

    async init(): Promise<void> {
        return;
    }

    async delete(req, res): Promise<void> {
        throw Boom.notImplemented()
    }

    async download(req, res): Promise<Download> {
        const customConfig = this.instance.config.custom;
        customConfig.allowedHosts = customConfig.allowedHosts || [];
        const download = new Download();
        const url = req.query.url || decodeURIComponent(req.path.substr(req.path.indexOf('/',1) + 1));
        const urlObject = new URL(url);
        if(!isEmpty(customConfig.allowedHosts)){
            const host = urlObject.host;
            const isPresent = customConfig.allowedHosts.find(allowedHost => host.indexOf(allowedHost));
            if(!isPresent){
                throw Boom.forbidden('Host not allowed by the proxy');
            }
        }
        download.data = await request(url);
        return download;
    }

    async upload(req, res): Promise<Upload[]> {
        throw Boom.notImplemented()
    }

}