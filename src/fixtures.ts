import {sequelizeConfig} from "./config/sequelize";
import {StorageFixtures} from "./storage/fixtures";

;
export class Fixtures{

    static async load(){
        await StorageFixtures.load();
        if(sequelizeConfig.forceSync){
        }
    }
}
