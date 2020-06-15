import {ProviderInstance} from './model'
import {Op, or} from "sequelize";
import {Webhook, WebhookType} from "../webhook/model";


export class StorageRepository{

    private static pInstance: StorageRepository;

    static get instance() : StorageRepository {
        return StorageRepository.getInstance();
    }

    private static getInstance() {
        if (!StorageRepository.pInstance) {
            StorageRepository.pInstance = new StorageRepository();
        }
        return StorageRepository.pInstance;
    }


    async fetchDefault(){
        return ProviderInstance.findOne({ where: { isDefault: true }, include:[{model: Webhook, required: false, include:[{model: WebhookType, required: false}]}]});
    }

    async fetchFirst(){
        return ProviderInstance.findOne({ order: [['id','ASC']], include:[{model: Webhook, required: false, include:[{model: WebhookType, required: false}]}]});
    }

    async fetchByNameOrDefault(name: string){
        let storage;
        if(name){
            storage = await this.fetchByName(name);
        }
        if(!storage){
            storage = await this.fetchDefault();
        }
        if(!storage){
            storage = await this.fetchFirst();
        }
        return storage;
    }


    async fetchByName(name: string){
        return ProviderInstance.findOne({ where: { name }, include:[{model: Webhook, required: false, include:[{model: WebhookType, required: true}]}]});
    }

    async fetchByType(type: string){
        return ProviderInstance.findOne({ where: { type }, include:[{model: Webhook, required: false, include:[{model: WebhookType, required: false}]}]});
    }

    fetchAll(){
        return ProviderInstance.findAll();
    }

}
