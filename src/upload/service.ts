import {StorageService} from "../storage/service";
import {Storage} from "../storage/model";
import {fs as fsm} from "memfs";
import * as fs from "fs";
import * as uuid from 'uuid/v4';
import {Upload} from "./model";
import {serialize} from "serializr";
import {StreamHelper} from "../helper/streamHelper";
import * as pkgcloud from "pkgcloud";
import {FormHelper} from "../helper/form";
import {join} from "path";
import {S3, Endpoint} from 'aws-sdk';
import {URLHelper} from "../helper/url";
import {oc} from "ts-optchain";

export class UploadService {

    private static pInstance: UploadService;

    static get instance(): UploadService {
        return UploadService.getInstance();
    }

    private static getInstance() {
        if (!UploadService.pInstance) {
            UploadService.pInstance = new UploadService();
        }
        return UploadService.pInstance;
    }


    async post(req, res) {
        const storage = await StorageService.instance.findByRequest(req);
        const uploads = await this.uploadToStorage(storage, req);
        uploads.forEach(upload => {
            upload.urls = URLHelper.getUrls(storage, upload);
        });
        res.json(serialize(uploads)).end();
    }

    async uploadToStorage(storage: Storage, req: Request) {

        switch (storage.type.name) {
            case 'memory':
                return this.uploadToMemory(storage, req);
                break;
            case 'filesystem':
                return this.uploadToFilesystem(storage, req);
                break;
            case 'openstack':
                storage.config.custom.provider = 'openstack';
                return this.uploadWithPkgcloud(storage, req);
                break;
            case 'gcs':
                storage.config.custom.provider = 'google';
                const fullPath = join(__dirname, '../../secret', storage.uuid + '.json');
                storage.config.custom.keyFilename = fullPath;
                delete storage.config.custom['keyFile'];
                return this.uploadWithPkgcloud(storage, req);
                break;
            case 's3':
                storage.config.custom.provider = 'amazon';
                return this.uploadWithPkgcloud(storage, req);
                break;
            case 'azure':
                storage.config.custom.provider = 'azure';
                return this.uploadWithPkgcloud(storage, req);
                break;
            case 'rackspace':
                storage.config.custom.provider = 'rackspace';
                return this.uploadWithPkgcloud(storage, req);
                break;
            case 'spaces':
                return this.uploadWithS3(storage, req);
                break;
            case 'scaleway':
                return this.uploadWithS3(storage, req);
                break;
            case 'webfolder':
                throw new Error('Can not upload file to a webfolder type storage');
                break;
            case 'proxy':
                throw new Error('Can not upload file to a proxy type storage');
                break;
        }
    }


    async uploadWithPkgcloud(storage, req) {
        const parts = await FormHelper.getBuffers(req);
        const files = await this.uploadPartsWithPkgCloud(storage, parts);
        return files;
    }

    async uploadWithS3(storage, req) {
        const parts = await FormHelper.getBuffers(req);
        const files = await this.uploadPartsWithS3(storage, parts);
        return files;
    }

    async uploadToMemory(storage, req) {
        const parts = await FormHelper.getBuffers(req);
        const files = await this.uploadPartsToMemory(storage, parts);
        return files;
    }

    async uploadToFilesystem(storage, req) {
        const parts = await FormHelper.getBuffers(req);

        const files = await this.uploadPartsToFilesystem(storage, parts);

        return files;
    }

    uploadPartsWithPkgCloud(storage, parts) {
        const files = parts.map(part => this.uploadPartWithPkgCloud(storage, part));
        return Promise.all<Upload>(files);
    }

    uploadPartsWithS3(storage, parts) {
        const files = parts.map(part => this.uploadPartWithS3(storage, part));
        return Promise.all<Upload>(files);
    }

    uploadPartsToFilesystem(storage, parts) {
        const files = parts.map(part => this.uploadPartToFilesystem(storage, part));
        return Promise.all<Upload>(files);
    }

    uploadPartsToMemory(storage, parts) {
        const files = parts.map(part => this.uploadPartToMemory(storage, part));
        return Promise.all<Upload>(files);
    }

    uploadPartToMemory(storage, upload) {
        return this.uploadPartToFilesystemInterface(storage, upload, fsm);
    }

    uploadPartToFilesystem(storage, upload) {
        return this.uploadPartToFilesystemInterface(storage, upload, fs);
    }


    async uploadPartWithS3(storage, upload: Upload) {
        const fileName = uuid() + '.' + upload.type.extension;
        const customConfig = storage.config.custom;
        const spacesEndpoint = new Endpoint(customConfig.endpoint);
        customConfig.endpoint = spacesEndpoint;
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

    uploadPartWithPkgCloud(storage, upload: Upload) {
        return new Promise((resolve, reject) => {
            const fileName = uuid() + '.' + upload.type.extension;
            upload.fileName = fileName;
            upload.urls = [fileName];
            const config = storage.config.custom;
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

            filesystemStream.on('end', () => {
                resolve(upload);
            });
            filesystemStream.on('close', () => {
                resolve(upload);
            });
            filesystemStream.pipe(writeStream);
        });
    }

    uploadPartToFilesystemInterface(storage, upload, filesystemImplementation) {
        return new Promise((resolve, reject) => {

            const path = StorageService.getPath(storage);
            const fileName = uuid() + '.' + upload.type.extension;
            const fullPath = join(path , fileName);


            upload.fileName = fileName;
            upload.urls = [fileName];
            const writeStream = filesystemImplementation.createWriteStream(fullPath);
            const filesystemStream = StreamHelper.fromBuffer(upload.data);

            writeStream.on('close', () => {
                resolve(upload);
            });
            writeStream.on('error', (error) => {
                reject(error);
            });
            filesystemStream.pipe(writeStream);

        });
    }

}
