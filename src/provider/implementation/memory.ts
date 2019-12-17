import {ProviderInstance} from "../model";
import {Download} from "../../download/model";
import {FormHelper} from "../../helper/form";
import {StreamHelper} from "../../helper/streamHelper";
import {Upload} from "../../upload/model";
import * as uuid from "uuid/v4";
import {merge} from 'lodash';
import {ProviderService} from "../service";
import {join} from "path";

import {fs as fsm} from "memfs";
import {Provider, ProviderConfig} from "../interface";

export default class MemoryProvider implements Provider{

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

    getType(){
        return 'memory';
    }

    init(): Promise<void> {
        const path = ProviderService.getPath(this.instance);
        fsm.mkdirSync(path, {recursive: true});
        return;
    }

    delete(req, res): Promise<void> {
        const path = ProviderService.getPath(this.instance);
        const file = req.path.substr(req.path.indexOf('/', 1) + 1) ;
        fsm.unlinkSync(join(path, file));
        return;
    }

    async download(req, res): Promise<Download> {
        const path = ProviderService.getPath(this.instance);
        const fileName = req.path.substr(req.path.indexOf('/', 1) + 1);
        const filePath = join(path, fileName);
        const download = new Download();
        const stat = fsm.statSync(filePath);
        const buffer = fsm.readFileSync(filePath);
        const ft = FormHelper.guessFileType(buffer, filePath);
        res.set('Content-Length', stat.size);
        res.set('Content-Type', ft.mime);
        const rs = fsm.createReadStream(filePath);
        download.data = rs;
        return download;
    }

    async upload(req, res): Promise<Upload[]> {
        const parts = await FormHelper.getBuffers(req);
        const files = await this.uploadPartsToFilesystem(this.instance, parts);
        return files;
    }

    uploadPartsToFilesystem(storage, parts) {
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
            const writeStream = fsm.createWriteStream(fullPath);
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
