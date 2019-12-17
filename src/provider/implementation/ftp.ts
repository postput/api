import {ProviderInstance} from '../model'
import {Download} from "../../download/model";
import {Upload} from "../../upload/model";
import {FormHelper} from "../../helper/form";
import {StreamHelper} from "../../helper/streamHelper";
import * as uuid from "uuid/v4";
import {merge} from 'lodash';
import * as IBM from "ibm-cos-sdk";
import Logger from "../../logger";
import {join} from "path";
import * as Client from 'ssh2-sftp-client';
import {Provider, ProviderConfig} from "../interface";

export default class FTPProvider implements Provider{

    instance: ProviderInstance;
    defaultConfig: ProviderConfig = {
        allowUpload : true,
        maxUploadSize: undefined,
        urls: ['http://www.example.com/'],
        custom: {
            host: "localhost",
            port: 2222,
            username: "foo",
            root: "upload",
            privateKey: "-----BEGIN RSA PRIVATE KEY-----XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-----END RSA PRIVATE KEY-----"
        }
    };

    public constructor(storage: ProviderInstance){
        this.instance = storage;
        storage.config = merge(this.defaultConfig, storage.config)
    }

    getType(){
        return 'ftp';
    }

    async init(): Promise<void> {
        return;
    }

    async delete(req, res): Promise<void> {
        const path = req.path.substr(req.path.indexOf('/') + 1);
        const file = path.substr(path.indexOf('/') + 1);
        const ftpClient = new Client();
        const customConfig = this.instance.config.custom;
        await ftpClient.connect(customConfig);
        const download = new Download();
        const response = await ftpClient.delete(join(customConfig.root, file));
        await ftpClient.end();
        return response;
    }

    async download(req, res): Promise<Download> {
        const path = req.path.substr(req.path.indexOf('/') + 1);
        const file = path.substr(path.indexOf('/') + 1);
        const ftpClient = new Client();
        const customConfig = this.instance.config.custom;
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

    async upload(req, res): Promise<Upload[]> {
        const parts = await FormHelper.getBuffers(req);
        const files = await this.uploadParts(parts);
        return files;
    }

    uploadParts(parts) {
        const files = parts.map(part => this.uploadPart(part));
        return Promise.all<Upload>(files);
    }

    async uploadPart(upload){
        const ftpClient = new Client();
        const customConfig = this.instance.config.custom;
        const fileName = upload.nameOverride || uuid() + '.' + upload.type.extension;
        await ftpClient.connect(customConfig);
        await ftpClient.put(upload.data, join(customConfig.root, fileName), {
            flags: 'w',
            encoding: 'utf-8',
            mode: 0o666,
            autoClose: true});
        await ftpClient.end();
        upload.fileName = fileName;
        upload.urls = [fileName];
        return upload;
    }


}