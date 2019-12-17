import {ProviderInstance} from '../model'
import {Download} from "../../download/model";
import {Upload} from "../../upload/model";
import {Endpoint, S3} from "aws-sdk";
import Logger from "../../logger";
import {FormHelper} from "../../helper/form";
import {StreamHelper} from "../../helper/streamHelper";
import * as uuid from "uuid/v4";
import {merge} from 'lodash';
import {Provider, ProviderConfig} from "../interface";

export default class S3Provider implements Provider{

    instance: ProviderInstance;
    defaultConfig: ProviderConfig = {
        allowUpload : true,
        maxUploadSize: undefined,
        urls: ['http://www.example.com/'],
        custom: {
            accessKeyId: '<ReplaceMe>',
            secretAccessKey: '<replaceMe>',
            bucket: 'test',
            region: 'eu-west-3'
        }
    };

    public constructor(storage: ProviderInstance){
        this.instance = storage;
        storage.config = merge(this.defaultConfig, storage.config)
    }

    getType(){
        return 's3';
    }

    init(): Promise<void> {
        return;
    }

    delete(req, res): Promise<void> {
        const file = req.path.substr(req.path.indexOf('/', 1) + 1);
        const customConfig = this.instance.config.custom;
        if(customConfig.endpoint){
            const s3Endpoint = new Endpoint(customConfig.endpoint);
            customConfig.endpoint = s3Endpoint;
        }
        const s3 = new S3(customConfig);
        var params = {
            Bucket: customConfig.bucket,
            Key: file,
        };
        return new Promise((resolve, reject) => {
            s3.deleteObject(params).send((err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    download(req, res): Promise<Download> {
        const file = req.path.substr(req.path.indexOf('/', 1) + 1);
        const customConfig = this.instance.config.custom;
        if(customConfig.endpoint){
            const s3Endpoint = new Endpoint(customConfig.endpoint);
            customConfig.endpoint = s3Endpoint;
        }
        const s3 = new S3(customConfig);
        var params = {
            Bucket: customConfig.bucket,
            Key: file,
        };

        const download = new Download();

        return new Promise<Download>((resolve, reject) => {
            download.data = s3.getObject(params).send((err, data)=>{
                if(err){
                    Logger.error(err);
                    reject(err);
                    return;
                }
                const type = FormHelper.guessFileType(data.Body, file);
                res.setHeader('Content-Type', type.mime);
                res.setHeader('Content-Length', data.ContentLength);
                res.setHeader('Etag', data.ETag);
                res.setHeader('Last-Modified', data.LastModified);
                if(data.VersionId) {
                    res.setHeader('Version-Id', data.VersionId);
                }
                download.data = StreamHelper.fromBuffer(data.Body);
                resolve(download);
            });
        });
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
        const customConfig = this.instance.config.custom;
        if(customConfig.endpoint){
            const s3Endpoint = new Endpoint(customConfig.endpoint);
            customConfig.endpoint = s3Endpoint;
        }
        const s3 = new S3(customConfig);
        var params = {
            Bucket: customConfig.bucket,
            Key: fileName,
            Body: StreamHelper.fromBuffer(upload.data)
        };
        await s3.upload(params).promise();
        upload.fileName = fileName;
        upload.urls = [fileName];

        return upload;
    }

}