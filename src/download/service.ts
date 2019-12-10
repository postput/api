import {StorageService} from "../storage/service";
import {Endpoint, S3} from 'aws-sdk';
import {fs as fsm} from 'memfs';
import * as fs from 'fs';
import {Storage} from '../storage/model';
import {Download} from "./model";
import * as pkgcloud from 'pkgcloud';
import {OperationService} from "../operation/service";
import * as request from 'request';
import {isEmpty, merge} from 'lodash';
import {join} from 'path';
import * as B2 from 'backblaze-b2';
import {resolve} from 'url';
import {WebhookService} from "../webhook/service";
import * as Client from 'ssh2-sftp-client';
import {StreamHelper} from "../helper/streamHelper";
import * as send from 'send';
import Logger from "../logger";
import * as fileType from "file-type";
import {FormHelper} from "../helper/form";
import sharp = require("sharp");

export class DownloadService{

    private static pInstance: DownloadService;

    static get instance() : DownloadService {
        return DownloadService.getInstance();
    }

    private static getInstance() {
        if (!DownloadService.pInstance) {
            DownloadService.pInstance = new DownloadService();
        }
        return DownloadService.pInstance;
    }


    async get(req, res){
        const storage = await StorageService.instance.findByRequest(req);

        const download = await this.downloadFromStorage(storage, req, res);

        await OperationService.instance.applyOperations(download, req, res);

        download.data.pipe(res);
        await WebhookService.instance.send(storage, req);
    }


    async downloadFromStorage(storage: Storage, req: Request, res: Response): Promise<Download> {

        switch (storage.type.name) {
            case 'memory':
                return this.downloadFromMemory(storage, req, res);
                break;
            case 'filesystem':
                return this.downloadFromFilesystem(storage, req, res);
                break;
            case 'openstack':
                storage.config.custom.provider = 'openstack';
                return this.downloadWithPkgCloud(storage, req, res);
                break;
            case 'gcs':
                storage.config.custom.provider = 'google';
                const fullPath = join(__dirname, '../../secret', storage.uuid +'.json');
                storage.config.custom.keyFilename = fullPath;
                delete storage.config.custom['keyFile'];
                return this.downloadWithPkgCloud(storage, req, res);
                break;
            case 'S3':
                return this.downloadWithS3(storage, req, res);
                break;
            case 'azure':
                storage.config.custom.provider = 'azure';
                return this.downloadWithPkgCloud(storage, req, res);
                break;
            case 'rackspace':
                storage.config.custom.provider = 'rackspace';
                return this.downloadWithPkgCloud(storage, req, res);
                break;
            case 'spaces':
                return this.downloadWithS3(storage, req, res);
                break;
            case 'scaleway':
                return this.downloadWithS3(storage, req, res);
                break;
            case 'webfolder':
                return this.downloadFromWebfolder(storage, req);
                break;
            case 'proxy':
                return this.downloadFromURL(storage, req);
                break;
            case 'backblaze':
                return this.downloadWithBackblaze(storage, req, res);
                break;
            case 'ftp':
                return this.downloadWithFTP(storage, req, res);
                break;
        }
    }

    async downloadFromMemory(storage, req, res){
        return this.downloadFromFilesystemInterface(storage, req, res, fsm);
    }

    async downloadFromURL(storage, req){
        const customConfig = storage.config.custom;
        customConfig.allowedHosts = customConfig.allowedHosts || [];
        const download = new Download();
        const url = req.query.url || decodeURIComponent(req.path.substr(req.path.indexOf('/',1) + 1));
        const urlObject = new URL(url);
        if(!isEmpty(customConfig.allowedHosts)){
            const host = urlObject.host;
            const isPresent = customConfig.allowedHosts.find(allowedHost => host.indexOf(allowedHost));
            if(!isPresent){
                throw Error('Host not allowed by the proxy');
            }
        }
        download.data = await request(url);
        return download;
    }

    async downloadFromWebfolder(storage, req){
        const file = req.path.substr(req.path.indexOf('/',1));
        const customConfig = storage.config.custom;

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

    async downloadFromFilesystem(storage, req, res){
        return this.downloadFromFilesystemInterface(storage, req, res, fs);
    }

    async downloadFromFilesystemInterface(storage, req, res, filesystemInterface){
        const path = StorageService.getPath(storage);
        const fileName = req.path.substr(req.path.indexOf('/', 1) + 1);
        const filePath = join(path, fileName);
        const download = new Download();
        const stat = filesystemInterface.statSync(filePath);
        const buffer = filesystemInterface.readFileSync(filePath);
        const ft = FormHelper.guessFileType(buffer, filePath);
        res.set('Content-Length', stat.size);
        res.set('Content-Type', ft.mime);
        const rs = filesystemInterface.createReadStream(filePath);
        download.data = rs;
        return download;
    }

    async downloadWithS3(storage, req, res){
        const file = req.path.substr(req.path.indexOf('/', 1) + 1);
        const customConfig = storage.config.custom;
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
                if(err) Logger.error(err);
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

    async downloadWithFTP(storage, req, res){
        const path = req.path.substr(req.path.indexOf('/') + 1);
        const file = path.substr(path.indexOf('/') + 1);
        const ftpClient = new Client();
        const customConfig = storage.config.custom;
        await ftpClient.connect(customConfig);
        const download = new Download();
        const buffer =  await ftpClient.get(join(customConfig.root, file));
        const type = FormHelper.guessFileType(buffer, file);
        res.setHeader('Content-Length', buffer.byteLength );
        res.setHeader('Content-Type', type.mime );
        download.data = StreamHelper.fromBuffer(buffer);
        await ftpClient.end();
        return download;
    }

    async downloadWithBackblaze(storage, req, res) {
        const path = req.path.substr(req.path.indexOf('/') + 1);
        const file = path.substr(path.indexOf('/') + 1);
        const customConfig = storage.config.custom;
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

    async downloadWithPkgCloud(storage, req, res){
        const path = req.path.substr(req.path.indexOf('/') + 1);
        const file = path.substr(path.indexOf('/') + 1);
        const download = new Download();
        const openstackClient = pkgcloud.storage.createClient(storage.config.custom);

        const readStream = openstackClient.download({
            container: storage.config.custom.container,
            remote: file
        });

        download.data = readStream;
        readStream.on('response', (data) =>{
            res.set(data.headers);
        });
        return download;
    }

    async post(){

    }


}
