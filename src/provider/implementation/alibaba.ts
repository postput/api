import {Provider, ProviderConfig, ProviderInstance} from '../model'
import {Download} from "../../download/model";
import {Upload} from "../../upload/model";
import {FormHelper} from "../../helper/form";
import {StreamHelper} from "../../helper/streamHelper";
import * as uuid from "uuid/v4";
import {merge} from 'lodash';
import * as OSS from "ali-oss";

export default class AlibabaProvider implements Provider{

    static type = 'alibaba';

    instance: ProviderInstance;
    defaultConfig: ProviderConfig = {
        allowUpload : true,
        maxUploadSize: undefined,
        urls: ['http://www.example.com/'],
        custom: {
            region: "oss-eu-central-1",
            accessKeyId: "Lsdfmjhsdfmgkljhmsfdmgl",
            accessKeySecret: "fjqnshdmfjnmùqslkdjfmlkqsjdf",
            bucket: "testpostput"
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
        const file = req.path.substr(req.path.indexOf('/', 1) + 1);
        const customConfig = this.instance.config.custom;
        const client = new OSS(customConfig);
        client.useBucket(customConfig.bucket);
        //@ts-ignore
        const {res: response} = await client.delete(file);
        res.set(response.headers);
        res.status(response.status);
        return response;
    }

    async download(req, res): Promise<Download> {
        const file = req.path.substr(req.path.indexOf('/', 1) + 1);
        const customConfig = this.instance.config.custom;
        const client = new OSS(customConfig);
        client.useBucket(customConfig.bucket);
        const {res: response, content} = await client.get(file);
        res.set(response.headers);
        const download = new Download();
        download.data = StreamHelper.fromBuffer(content);
        return download;
    }

    async upload(req, res): Promise<Upload[]> {
        const parts = await FormHelper.getBuffers(req);
        const files = await this.uploadParts(this.instance, parts);
        return files;
    }

    uploadParts(storage, parts) {
        const files = parts.map(part => this.uploadPart(part));
        return Promise.all<Upload>(files);
    }

    async uploadPart(upload: Upload) {
        const fileName = upload.nameOverride || uuid() + '.' + upload.type.extension;
        const customConfig = this.instance.config.custom;
        const client = new OSS(customConfig);
        client.useBucket(customConfig.bucket);
        const response = await client.put(fileName, upload.data);
        upload.fileName = fileName;
        upload.urls = [fileName];
        return upload;
    }

}