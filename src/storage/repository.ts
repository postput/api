import {Storage, StorageType} from './model'
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

    async fetchByNameOrUUID(string: string){
        return Storage.findOne({ where: { [Op.or]: [ {name: string, uuid: string} ] }, include:[{model: StorageType, required: true}, {model: Webhook, required: false, include:[{model: WebhookType, required: true}]}]});
    }

    async fetchDefault(){
        return Storage.findOne({ where: { isDefault: true }, include:[{model: StorageType, required: true}, {model: Webhook, required: false, include:[{model: WebhookType, required: true}]}]});
    }

    async fetchFirst(){
        return Storage.findOne({ order: [['id','ASC']], include:[{model: StorageType, required: true}, {model: Webhook, required: false, include:[{model: WebhookType, required: true}]}]});
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
        return Storage.findOne({ where: { name: name }, include:[{model: StorageType, required: true}, {model: Webhook, required: false, include:[{model: WebhookType, required: true}]}]});
    }

    async fetchByTypeId(typeId: number){
        return Storage.findOne({ where: { typeId }, include:[{model: StorageType, required: true}, {model: Webhook, required: false, include:[{model: WebhookType, required: false}]}]});
    }
    
    async fetchByUUID(uuid: string){
        return Storage.findOne({ where: { uuid: uuid }, include:[{model: StorageType, required: true}, {model: Webhook, required: false, include:[{model: WebhookType, required: true}]}]});
    }

    fetchAllStorage(){
        return Storage.findAll({include:[{model: StorageType, required: true}]});
    }

}
