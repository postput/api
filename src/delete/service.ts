import {ProviderService} from "../provider/service";
import {ProviderBuilder, ProviderInstance} from "../provider/model";
import {fs as fsm} from "memfs";
import * as fs from "fs";
import * as pkgcloud from "pkgcloud";
import {join} from "path";
import {Endpoint, S3} from 'aws-sdk';
import * as B2 from 'backblaze-b2';
import {WebhookService} from "../webhook/service";
import * as Client from 'ssh2-sftp-client';
import {Download} from "../download/model";
import * as IBM from 'ibm-cos-sdk';
import * as OSS from "ali-oss";
const ftpClient = new Client();

export class DeleteService {

    private static pInstance: DeleteService;

    static get instance(): DeleteService {
        return DeleteService.getInstance();
    }

    private static getInstance() {
        if (!DeleteService.pInstance) {
            DeleteService.pInstance = new DeleteService();
        }
        return DeleteService.pInstance;
    }


    async delete(req, res) {
        const providerInstance = await ProviderService.instance.findByRequest(req);
        const provider = ProviderBuilder.instance.build(providerInstance);
        res.status(200);
        await provider.delete(req, res);
        res.end();
        await WebhookService.instance.send(providerInstance, req);
    }

    async deleteFromStorage(storage: ProviderInstance, req: Request, res) {
        switch (storage.type) {
            case 'memory':
                return this.deleteFromMemory(storage, req);
                break;
            case 'filesystem':
                return this.deleteFromFilesystem(storage, req);
                break;
            case 'openstack':
                storage.config.custom.provider = 'openstack';
                return this.deleteWithPkgcloud(storage, req);
                break;
            case 'gcs':
                storage.config.custom.provider = 'google';
                const fullPath = join(__dirname, '../../secret', storage.name + '.json');
                storage.config.custom.keyFilename = fullPath;
                delete storage.config.custom['keyFile'];
                return this.deleteWithPkgcloud(storage, req);
                break;
            case 'S3':
                return this.deleteFromS3(storage, req);
                break;
            case 'IBM':
                return this.deleteFromIBM(storage, req);
                break;
            case 'alibaba':
                return this.deleteFromAlibaba(storage, req, res);
                break;
            case 'azure':
                storage.config.custom.provider = 'azure';
                return this.deleteWithPkgcloud(storage, req);
                break;
            case 'rackspace':
                storage.config.custom.provider = 'rackspace';
                return this.deleteWithPkgcloud(storage, req);
                break;
            case 'spaces':
                return this.deleteFromS3(storage, req);
                break;
            case 'scaleway':
                return this.deleteFromS3(storage, req);
                break;
            case 'webfolder':
                throw new Error('Can not upload file to a webfolder type storage');
                break;
            case 'proxy':
                throw new Error('Can not upload file to a proxy type storage');
                break;
            case 'backblaze':
                return this.deleteWithBackBlaze(storage, req);
                break;
            case 'ftp':
                return this.deleteWithFTP(storage, req);
                break;


        }
    }


    async deleteWithPkgcloud(storage, req) {
        const path = req.path.substr(req.path.indexOf('/') + 1);
        const file = path.substr(path.indexOf('/') + 1);
        const openstackClient = pkgcloud.storage.createClient(storage.config.custom);
        return new Promise((resolve, reject) => {
            openstackClient.removeFile(storage.config.custom.container, file, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }


    async deleteWithBackBlaze(storage, req) {
        const path = req.path.substr(req.path.indexOf('/') + 1);
        const file = path.substr(path.indexOf('/') + 1);
        const customConfig = storage.config.custom;
        const b2 = new B2(customConfig);
        await b2.authorize();
        return b2.deleteFileVersion({
            bucketName: customConfig.bucketName,
            fileName: file,
            fileId: req.query.fileId
        });
    }

    async deleteFromS3(storage, req) {
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
        return new Promise((resolve, reject) => {
            s3.deleteObject(params).send((err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    async deleteFromIBM(storage, req) {
        const file = req.path.substr(req.path.indexOf('/', 1) + 1);
        const customConfig = storage.config.custom;
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
                    resolve(data);
                }
            });
        });
    }

    async deleteFromAlibaba(storage, req, res) {
        const file = req.path.substr(req.path.indexOf('/', 1) + 1);
        const customConfig = storage.config.custom;
        const client = new OSS(customConfig);
        client.useBucket(customConfig.bucket);
        //@ts-ignore
        const {res: response} = await client.delete(file);
        res.set(response.headers);
        res.status(response.status);
        return response;
    }



    deleteFromMemory(storage, req) {
        return this.deleteFromFilesystemInterface(storage, req, fsm);
    }

    deleteFromFilesystem(storage, req) {
        return this.deleteFromFilesystemInterface(storage, req, fs)
    }

    deleteFromFilesystemInterface(storage, req, filesystemImplementation) {
        const path = ProviderService.getPath(storage);
        const file = req.path.substr(req.path.indexOf('/', 1) + 1) ;
        return new Promise((resolve, reject) => {
            filesystemImplementation.unlink(join(path, file), (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data);
                }
            });
        });

    }

    async deleteWithFTP(storage, req) {
        const path = req.path.substr(req.path.indexOf('/') + 1);
        const file = path.substr(path.indexOf('/') + 1);
        const ftpClient = new Client();
        const customConfig = storage.config.custom;
        await ftpClient.connect(customConfig);
        const download = new Download();
        const response = await ftpClient.delete(join(customConfig.root, file));
        await ftpClient.end();
        return response;
    }

}
