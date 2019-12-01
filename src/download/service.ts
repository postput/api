import {StorageService} from "../storage/service";
import {S3, Endpoint} from 'aws-sdk';
import {fs as fsm} from 'memfs';
import * as fs from 'fs';
import {Storage} from '../storage/model';
import {Download} from "./model";
import * as pkgcloud from 'pkgcloud';
import {OperationService} from "../operation/service";
import * as request from 'request';
import {merge, isEmpty} from 'lodash';
import {join} from 'path';
import * as B2 from 'backblaze-b2';
import {resolve} from 'url';
import {WebhookService} from "../webhook/service";

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

        const download = await this.downloadFromStorage(storage, req);

        const modifiedStream = await OperationService.instance.applyOperations(download.data, req.query);
        WebhookService.instance.send(storage, req).then();
        modifiedStream.pipe(res);
        
        //download.data.pipe(res);
    }


    async downloadFromStorage(storage: Storage, req: Request): Promise<Download> {

        switch (storage.type.name) {
            case 'memory':
                return this.downloadFromMemory(storage, req);
                break;
            case 'filesystem':
                return this.downloadFromFilesystem(storage, req);
                break;
            case 'openstack':
                storage.config.custom.provider = 'openstack';
                return this.downloadWithPkgCloud(storage, req);
                break;
            case 'gcs':
                storage.config.custom.provider = 'google';
                const fullPath = join(__dirname, '../../secret', storage.uuid +'.json');
                storage.config.custom.keyFilename = fullPath;
                delete storage.config.custom['keyFile'];
                return this.downloadWithPkgCloud(storage, req);
                break;
            case 's3':
                storage.config.custom.provider = 'amazon';
                return this.downloadWithPkgCloud(storage, req);
                break;
            case 'azure':
                storage.config.custom.provider = 'azure';
                return this.downloadWithPkgCloud(storage, req);
                break;
            case 'rackspace':
                storage.config.custom.provider = 'rackspace';
                return this.downloadWithPkgCloud(storage, req);
                break;
            case 'spaces':
                return this.downloadWithS3(storage, req);
                break;
            case 'scaleway':
                return this.downloadWithS3(storage, req);
                break;
            case 'webfolder':
                return this.downloadFromWebfolder(storage, req);
                break;
            case 'proxy':
                return this.downloadFromURL(storage, req);
                break;
            case 'backblaze':
                return this.downloadWithBackblaze(storage, req);
                break;
        }
    }

    async downloadFromMemory(storage, req){
        const path = StorageService.getPath(storage);
        const fileName = req.path.substr(req.path.lastIndexOf('/') + 1) ;
        const download = new Download();
        download.data = fsm.createReadStream(join(path, fileName));
        return download;
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

    async downloadFromFilesystem(storage, req){
        const path = StorageService.getPath(storage);
        const fileName = req.path.substr(req.path.lastIndexOf('/') + 1) ;
        const download = new Download();
        download.data = fs.createReadStream(join(path, fileName));
        return download;
    }

    async downloadWithS3(storage, req){
        const file = req.path.substr(req.path.indexOf('/', 1) + 1);
        const customConfig = storage.config.custom;
        const spacesEndpoint = new Endpoint(customConfig.endpoint);
        customConfig.endpoint = spacesEndpoint;
        const s3 = new S3(customConfig);
        var params = {
            Bucket: customConfig.bucket,
            Key: file,
        };

        const download = new Download();
        download.data = s3.getObject(params).createReadStream();
        return download;
    }

    async downloadFromSpaces(storage, req){
        return this.downloadWithS3(storage.config, req);
    }

    async downloadFromScaleway(storage, req){
        return this.downloadWithS3(storage.config, req);
    }

    async downloadWithBackblaze(storage, req) {
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
        const download = new Download();
        download.data = response.data;
        return download;
    }

    async downloadWithPkgCloud(storage, req){
        const path = req.path.substr(req.path.indexOf('/') + 1);
        const file = path.substr(path.indexOf('/') + 1);
        const download = new Download();
        const openstackClient = pkgcloud.storage.createClient(storage.config.custom);

        const readStream = openstackClient.download({
            container: storage.config.custom.container,
            remote: file
        });

        download.data = readStream;
        return download;
    }

    async post(){

    }


}
