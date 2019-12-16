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
import * as B2 from 'backblaze-b2';

export default class BackbkazeProvider implements Provider{

    static type = 'backblaze';

    instance: ProviderInstance;
    defaultConfig: ProviderConfig = {
        allowUpload : true,
        maxUploadSize: undefined,
        urls: ['http://www.example.com/'],
        custom: {
            applicationKeyId: "qsdfkljbnqsmkdjfhmqskjdhf",
            applicationKey: "qsmdoofihmlqskdjfmlkjqsdmflkjqmsldk",
            bucketName: "test",
            bucketId: "qsdfg4sdfg54sd6f54g6sdfg"
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
        const path = req.path.substr(req.path.indexOf('/') + 1);
        const file = path.substr(path.indexOf('/') + 1);
        const customConfig = this.instance.config.custom;
        const b2 = new B2(customConfig);
        await b2.authorize();
        return b2.deleteFileVersion({
            bucketName: customConfig.bucketName,
            fileName: file,
            fileId: req.query.fileId
        });
    }

    async download(req, res): Promise<Download> {
        const path = req.path.substr(req.path.indexOf('/') + 1);
        const file = path.substr(path.indexOf('/') + 1);
        const customConfig = this.instance.config.custom;
        const b2 = new B2(customConfig);
        await b2.authorize();
        const response = await b2.downloadFileByName({
            bucketName: customConfig.bucketName,
            fileName: file,
            responseType: 'stream'
        });

        res.set(response.headers);
        const download = new Download();
        download.data = response.data;
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

    async uploadPart(upload: Upload) {

        const fileName = upload.nameOverride || uuid() + '.' + upload.type.extension;
        const customConfig : any = this.instance.config.custom;
        const b2 = new B2(customConfig);
        await b2.authorize();
        const uploadUrlResponse = await b2.getUploadUrl(customConfig.bucketId);
        await b2.uploadFile({
            uploadUrl: uploadUrlResponse.data.uploadUrl,
            uploadAuthToken: uploadUrlResponse.data.authorizationToken,
            fileName: fileName,
            contentLength: upload.data.length,
            mime: upload.type.mime,
            data: upload.data
        });
        upload.fileName = fileName;
        upload.urls = [fileName];
        return upload;
    }

}