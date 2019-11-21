import {Async} from "../helper/async";

const fixtures = require('sequelize-fixtures');
import { SequelizeBuilder } from '../sequelizeBuilder'
import {readdirSync} from 'fs'
import {join} from 'path'

export class StorageFixtures{

    static async load(){
        const dataDir = join(__dirname, '../../','data');
        const storageTypeDir = join(dataDir, 'storage-type');
        const storageDir = join(dataDir, 'storage');
        const storageTypeFiles = readdirSync(storageTypeDir);
        const storageFiles = readdirSync(storageDir);

        await Async.foreach(storageTypeFiles, async file => {
            await fixtures.loadFile(join(storageTypeDir, file) , SequelizeBuilder.sequelize.models);
        });

        await Async.foreach(storageFiles, async file => {
            await fixtures.loadFile(join(storageDir, file) , SequelizeBuilder.sequelize.models);
        });
    }
}
