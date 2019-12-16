import {Provider, ProviderConfig, ProviderInstance} from '../model'
import {Download} from "../../download/model";
import {Upload} from "../../upload/model";
import {Endpoint, S3} from "aws-sdk";
import Logger from "../../logger";
import {FormHelper} from "../../helper/form";
import {StreamHelper} from "../../helper/streamHelper";
import * as uuid from "uuid/v4";
import {merge} from 'lodash';
import * as pkgcloud from "pkgcloud";

export default class PKGCloudProvider implements Provider{

    instance: ProviderInstance;
    defaultConfig: ProviderConfig = {
        allowUpload : true,
        maxUploadSize: undefined,
        urls: ['http://www.example.com/'],
        custom: {}
    };

    public constructor(storage: ProviderInstance){
        this.instance = storage;
        storage.config = merge(this.defaultConfig, storage.config)
    }

    async init(): Promise<void> {
        return;
    }

    async delete(req, res): Promise<void> {
        const path = req.path.substr(req.path.indexOf('/') + 1);
        const file = path.substr(path.indexOf('/') + 1);
        const openstackClient = pkgcloud.storage.createClient(this.instance.config.custom);
        return new Promise((resolve, reject) => {
            openstackClient.removeFile(this.instance.config.custom.container, file, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async download(req, res): Promise<Download> {
        const path = req.path.substr(req.path.indexOf('/') + 1);
        const file = path.substr(path.indexOf('/') + 1);
        const download = new Download();
        const openstackClient = pkgcloud.storage.createClient(this.instance.config.custom);

        const readStream = openstackClient.download({
            container: this.instance.config.custom.container,
            remote: file
        });

        download.data = readStream;
        readStream.on('response', (data) =>{
            res.set(data.headers);
        });
        return download;
    }

    async upload(req, res): Promise<Upload[]> {
        const parts = await FormHelper.getBuffers(req);
        const files = await this.uploadParts(parts);
        return files;
    }

    uploadParts(parts) {
        const files = parts.map(part => this.uploadPart(part));
        return Promise.all<Upload>(files);
    }

    uploadPart(upload: Upload) {
        return new Promise((resolve, reject) => {
            const fileName = upload.nameOverride || uuid() + '.' + upload.type.extension;
            upload.fileName = fileName;
            upload.urls = [fileName];
            const config = this.instance.config.custom;
            const pkgcloudClient = pkgcloud.storage.createClient(config);

            const writeStream = pkgcloudClient.upload({
                container: config.container,
                remote: fileName,
                //@ts-ignore
                contentType: upload.type.mime,
                size: upload.data.length,
                metadata: {}
            });
            const filesystemStream = StreamHelper.fromBuffer(upload.data);
            writeStream.on('success', () => {
                resolve(upload);
            });
            writeStream.on('error', (error) => {
                reject(error);
            });
            filesystemStream.pipe(writeStream);
        });
    }

}