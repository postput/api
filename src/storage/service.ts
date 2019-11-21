import {Request} from "express";
import {StorageRepository} from "./repository";
import * as isUUID from 'validator/lib/isUUID';
import * as _ from 'lodash';
import {Async} from "../helper/async";
import {writeFileSync} from "fs";
import {join} from 'path';
import {oc} from 'ts-optchain';
import {fs as fsm} from "memfs";
import * as fs from "fs";
import Logger from "../logger";

export class StorageService {

    private static pInstance: StorageService;

    static get instance(): StorageService {
        return StorageService.getInstance();
    }

    private static getInstance() {
        if (!StorageService.pInstance) {
            StorageService.pInstance = new StorageService();
        }
        return StorageService.pInstance;
    }


    static isStorageGivenInQuery(request: Request) {
        return request.query.storageName || request.query.storageId;
    }

    static getFileName(request: Request) {
        const path = request.path.substring(1);
        if (StorageService.isStorageGivenInQuery(request)) {
            return path;
        }
        return path.substring(path.indexOf("/") + 1);
    }

    static getFQDNFile(request: Request) {
        if (StorageService.isStorageGivenInQuery(request)) {

        }
    }

    async init() {
        const storages = await this.findAllStorage();
        let path;
        await Async.foreach(storages, async storage => {
            switch (storage.type.name) {
                case 'gcs':
                    const keyFile = oc(storage).config.custom.keyFile(null);
                    if (keyFile) {
                        const fullPath = join(__dirname, '../../secret', storage.uuid + '.json');
                        writeFileSync(fullPath, JSON.stringify(keyFile));
                    }
                    break;
                case 'memory':
                    path = StorageService.getPath(storage);
                    fsm.mkdirSync(path, {recursive: true});
                    break;

                case 'filesystem':
                    path = StorageService.getPath(storage);
                    try{
                        fs.mkdirSync(path, {recursive: true});
                    }
                    catch(error){
                        if(error.code === 'EEXIST'){
                            Logger.log(error, 'debug');
                        }
                        else{
                            Logger.error(error);
                        }
                    }
                    break;
            }
        });
    }

    static getPath(storage: Storage){
        const path = oc(storage).config.custom.path(join('public', storage.name));
        if(path.charAt(0) !== '/'){
            return join(__dirname, '../..', path)
        }

        return path;
    }

    async findByRequest(request: Request) {
        if (request.query.storageName) {
            return this.findByName(request.query.storageName);
        }

        if (request.query.storageId) {
            return this.findByUUID(request.query.storageId);
        }
        const pathFragments = request.path.split('/');
        const firstPart = pathFragments[1];
        if (firstPart) {
            if (isUUID(firstPart)) {
                return this.findByUUID(request.query.storageId);
            }
            const storage = await this.findByName(firstPart);
            return storage;
        }
    }

    async findByUUID(uuid) {
        return StorageRepository.instance.fetchByUUID(uuid);
    }

    async findByName(name) {
        return StorageRepository.instance.fetchByName(name);
    }

    async findAllStorage() {
        return StorageRepository.instance.fetchAllStorage();
    }


}
