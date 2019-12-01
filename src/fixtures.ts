import {sequelizeConfig} from "./config/sequelize";
import {StorageFixtures} from "./storage/fixtures";
import {WebhookFixtures} from "./webhook/fixtures";
import {extname, join} from "path";
import {readdirSync} from "fs";
import {Async} from "./helper/async";
import {SequelizeBuilder} from "./sequelizeBuilder";
import * as fixtures from 'sequelize-fixtures'
import {flatten} from 'lodash'
import {readFileSync} from "fs";
import stripJsonComments = require("strip-json-comments");

export class Fixtures{

    static async load(){
        await StorageFixtures.load();
        await WebhookFixtures.load();
        if(sequelizeConfig.forceSync){
        }
    }

    static getFilesMatchingExtensionsInDirectory(directory, extension){
        const files = readdirSync(directory).map(file => join(directory, file));
        return files.filter(file => extname(file) === extension);
    }

    static getFilesMatchingExtensionsInDirectories(directories, extension){
        const files = directories.map(directory => Fixtures.getFilesMatchingExtensionsInDirectory(directory, extension));
        return flatten(files);
    }

    static async loadFiles(files){
        await Async.foreach(files, async file => {
            const rawFixtures = readFileSync(file).toString();
            const jsonFixtures = JSON.parse(stripJsonComments(rawFixtures));
            await fixtures.loadFixtures(jsonFixtures , SequelizeBuilder.sequelize.models);
        });
    }

}
