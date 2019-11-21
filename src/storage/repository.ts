import {Storage, StorageType} from './model'
import {Op, or} from "sequelize";


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
        return Storage.findOne({ where: { [Op.or]: [ {name: string, uuid: string} ] }, include:[{model: StorageType, required: true}]});
    }

    async fetchByName(name: string){
        return Storage.findOne({ where: { name: name }, include:[{model: StorageType, required: true}]});
    }

    async fetchByUUID(uuid: string){
        return Storage.findOne({ where: { uuid: uuid }, include:[{model: StorageType, required: true}]});
    }

    async fetchAllStorage(){
        return Storage.findAll({include:[{model: StorageType, required: true}]});
    }

}
