import {PostgresqlConfig, postgresqlConfig} from './postgresql'
import { merge } from 'lodash'
import Logger from "../logger";
import {Env} from "../helper/env";
export interface SequelizeConfig extends PostgresqlConfig
{
    dialect: string;
    forceSync: boolean;
    logging: any;
}

const baseConfig = require('./json/sequelize.json');
baseConfig.logging = Logger.sequelizeLog;

const envConfig : any = {
    dialect: process.env.SEQUELIZE_DIALECT
};

if(process.env.SEQUELIZE_FORCE_SYNC){
    envConfig.forceSync = JSON.parse(process.env.SEQUELIZE_FORCE_SYNC);
}


export let sequelizeConfig : SequelizeConfig = merge(postgresqlConfig, baseConfig, envConfig);
