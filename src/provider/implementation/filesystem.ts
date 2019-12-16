import {Provider, ProviderConfig, ProviderInstance} from "../model";
import {Endpoint, S3} from "aws-sdk";
import {Download} from "../../download/model";
import Logger from "../../logger";
import {FormHelper} from "../../helper/form";
import {StreamHelper} from "../../helper/streamHelper";
import {Upload} from "../../upload/model";
import * as uuid from "uuid/v4";
import {merge} from 'lodash';
import {ProviderService} from "../service";
import {join} from "path";
import {createReadStream, createWriteStream, mkdirSync, readFileSync, statSync, unlinkSync} from "fs";

export default class FilesystemProvider implements Provider{
    static type = 'filesystem';

    instance: ProviderInstance;
    defaultConfig: ProviderConfig = {
        allowUpload : true,
        maxUploadSize: undefined,
        urls: ['http://www.example.com/'],
        custom: {
            "path": "public/default"
        }
    };

    public constructor(storage: ProviderInstance){
        this.instance = storage;
        storage.config = merge(this.defaultConfig, storage.config)
    }

    init(): Promise<void> {
        const path = ProviderService.getPath(this.instance);
        try{
            mkdirSync(path, {recursive: true});
        }
        catch(error){
            if(error.code === 'EEXIST'){
                Logger.log(error, 'debug');
            }
            else{
                Logger.error(error);
            }
        }
        return;
    }

    delete(req, res): Promise<void> {
        const path = ProviderService.getPath(this.instance);
        const file = req.path.substr(req.path.indexOf('/', 1) + 1) ;
        unlinkSync(join(path, file));
        return;
    }

    async download(req, res): Promise<Download> {
        const path = ProviderService.getPath(this.instance);
        const fileName = ProviderService.getFilename(req.path);
        const filePath = join(path, fileName);
        const download = new Download();
        const stat = statSync(filePath);
        const buffer = readFileSync(filePath);
        const ft = FormHelper.guessFileType(buffer, filePath);
        res.set('Content-Length', stat.size);
        res.set('Content-Type', ft.mime);
        const rs = createReadStream(filePath);
        download.data = rs;
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

    uploadPart(upload) {
        return new Promise((resolve, reject) => {
            const path = ProviderService.getPath(this.instance);
            const fileName = upload.nameOverride || uuid() + '.' + upload.type.extension;
            const fullPath = join(path , fileName);

            upload.fileName = fileName;
            upload.urls = [fileName];
            const writeStream = createWriteStream(fullPath);
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
