import {ProviderInstance} from '../model'
import {Download} from "../../download/model";
import {Upload} from "../../upload/model";
import {FormHelper} from "../../helper/form";
import {StreamHelper} from "../../helper/streamHelper";
import * as uuid from "uuid/v4";
import {merge} from 'lodash';
import * as IBM from "ibm-cos-sdk";
import Logger from "../../logger";
import {Provider, ProviderConfig} from "../interface";

export default class IBMProvider implements Provider{

    instance: ProviderInstance;
    defaultConfig: ProviderConfig = {
        allowUpload : true,
        maxUploadSize: undefined,
        urls: ['http://www.example.com/'],
        custom: {
            endpoint: "https://s3.eu-de.cloud-object-storage.appdomain.cloud",
            apiKeyId: "piqsdjfùpoijqs*ùdfpokqs*$podfkùpqoskdfùopkqsdf",
            ibmAuthEndpoint: "https://iam.cloud.ibm.com/identity/token",
            serviceInstanceId: "crn:v1:bluemix:public:cloud-object-storage:global:a/qùspdofjùqspodjfùosqjkdfùmlksqdmùlfk:sdfsdf-sdf-qsdf-aa0e-qsdfsqdfqsdf::",
            bucket: "testpostput"
        }
    };

    public constructor(storage: ProviderInstance){
        this.instance = storage;
        storage.config = merge(this.defaultConfig, storage.config)
    }

    getType(){
        return 'ibm';
    }

    async init(): Promise<void> {
        return;
    }

    async delete(req, res): Promise<void> {
        const file = req.path.substr(req.path.indexOf('/', 1) + 1);
        const customConfig = this.instance.config.custom;
        const s3 = new IBM.S3(customConfig);
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

    async download(req, res): Promise<Download> {
        const file = req.path.substr(req.path.indexOf('/', 1) + 1);
        const customConfig = this.instance.config.custom;
        const s3 = new IBM.S3(customConfig);
        var params = {
            Bucket: customConfig.bucket,
            Key: file,
        };

        const download = new Download();

        return new Promise<Download>((resolve, reject) => {
            download.data = s3.getObject(params).send((err, data)=>{
                if(err) {
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
        const s3 = new IBM.S3(customConfig);
        var params = {
            Bucket: customConfig.bucket,
            Key: fileName,
            Body: StreamHelper.fromBuffer(upload.data)
        };
        try{
            await s3.upload(params).promise();
        } catch (e){
            Logger.error(e);
        }

        upload.fileName = fileName;
        upload.urls = [fileName];
        return upload;
    }

}