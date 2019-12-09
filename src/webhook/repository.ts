import {Storage, StorageType} from "../storage/model";
import {Op} from "sequelize";

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

}