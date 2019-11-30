import {Sequelize} from "sequelize-typescript";
import {sequelizeConfig} from "./config/sequelize";
import {StorageType, Storage} from "./storage/model";
import {Webhook, WebhookType, WebhookTypes} from "./webhook/model";


export class SequelizeBuilder{
    private static instance: SequelizeBuilder;

    private sequelizeInstance : Sequelize;


    static get sequelize() : Sequelize {
        return SequelizeBuilder.getInstance().sequelizeInstance;
    }


    private constructor(){
        var t = sequelizeConfig;
        this.sequelizeInstance = new Sequelize(t);
        this.sequelizeInstance.addModels([StorageType, Storage, WebhookType, Webhook, WebhookTypes]);
    }

    private static getInstance() {
        if (!SequelizeBuilder.instance) {
            SequelizeBuilder.instance = new SequelizeBuilder();
        }
        return SequelizeBuilder.instance;
    }

}


