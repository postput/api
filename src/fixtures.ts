import {sequelizeConfig} from "./config/sequelize";
import {StorageFixtures} from "./storage/fixtures";
import {WebhookFixtures} from "./webhook/fixtures";

;
export class Fixtures{

    static async load(){
        await StorageFixtures.load();
        await WebhookFixtures.load();
        if(sequelizeConfig.forceSync){
        }
    }

    static async loadFromDir(){
        
    }
}
