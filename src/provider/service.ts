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
import {ProviderBuilder, ProviderInstance} from "./model";

export class ProviderService {

    private static pInstance: ProviderService;

    static get instance(): ProviderService {
        return ProviderService.getInstance();
    }

    private static getInstance() {
        if (!ProviderService.pInstance) {
            ProviderService.pInstance = new ProviderService();
        }
        return ProviderService.pInstance;
    }


    static isStorageGivenInQuery(request: Request) {
        return request.query.storageName || request.query.storageId;
    }

    async init() {
        const providerInstances = await this.findAll();
        await Async.foreach(providerInstances, async providerInstance => {
            const provider = ProviderBuilder.instance.build(providerInstance);
            await provider.init();
        });
    }

    static getPath(storage: ProviderInstance){
        const path = oc(storage).config.custom.path(join('public', storage.name));
        if(path.charAt(0) !== '/'){
            return join(__dirname, '../..', path)
        }

        return path;
    }

    static getFilename(path){
        return path.substr(path.indexOf('/', 1) + 1);
    }

    async findByRequest(request: Request) {
        if (request.query.storageName) {
            return this.findByName(request.query.storageName);
        }

        const pathFragments = request.path.split('/');
        const firstPart = pathFragments[1];
        return this.findByNameOrDefault(firstPart);
    }

    async findByType(type) {
        return StorageRepository.instance.fetchByType(type);
    }

    async findByName(name) {
        return StorageRepository.instance.fetchByName(name);
    }
    
    async findByNameOrDefault(name) {
        return StorageRepository.instance.fetchByNameOrDefault(name);
    }
    
    findAll() {
        return StorageRepository.instance.fetchAll();
    }


}
