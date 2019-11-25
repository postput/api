import {Async} from "../helper/async";

const fixtures = require('sequelize-fixtures');
import { SequelizeBuilder } from '../sequelizeBuilder'
import {readdirSync} from 'fs'
import {join, extname} from 'path'

export class StorageFixtures{

    static async load(){
        const dataDir = join(__dirname, '../../','data');
        const storageTypeDir = join(dataDir, 'storage-type');
        const storageDir = join(dataDir, 'storage');
        const customStorageDir = join(storageDir, 'custom');
        const storageTypeFiles = readdirSync(storageTypeDir).map(file => join(storageTypeDir, file));
        const storageFiles = readdirSync(storageDir).map(file => join(storageDir, file));
        const customStorageFiles = readdirSync(customStorageDir).map(file => join(customStorageDir, file));

        const allFiles = storageTypeFiles.concat(storageFiles, customStorageFiles);

        await Async.foreach(allFiles, async file => {
            const ext = extname(file);
            if(ext === '.json'){
                await fixtures.loadFile(file , SequelizeBuilder.sequelize.models);
            }
        });
    }
}
