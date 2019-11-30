import {Async} from "../helper/async";

const fixtures = require('sequelize-fixtures');
import { SequelizeBuilder } from '../sequelizeBuilder'
import {readdirSync} from 'fs'
import {join, extname} from 'path'

export class WebhookFixtures{

    static async load(){
        const dataDir = join(__dirname, '../../','data');
        const webhookTypeDir = join(dataDir, 'webhook-type');
        const webhookDir = join(dataDir, 'webhook');
        const customWebhookDir = join(webhookDir, 'custom');
        const webhookTypeFiles = readdirSync(webhookTypeDir).map(file => join(webhookTypeDir, file));
        const webhookFiles = readdirSync(webhookDir).map(file => join(webhookDir, file));
        const customWebhookFiles = readdirSync(customWebhookDir).map(file => join(customWebhookDir, file));

        const allFiles = webhookTypeFiles.concat(webhookFiles, customWebhookFiles);

        await Async.foreach(allFiles, async file => {
            const ext = extname(file);
            if(ext === '.json'){
                await fixtures.loadFile(file , SequelizeBuilder.sequelize.models);
            }
        });
    }
}
