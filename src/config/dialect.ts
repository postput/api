import {merge} from 'lodash';

export interface DialectConfig
{
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
}

const baseConfig = require('./json/dialect.json');

const envConfig = {
    host: process.env.DIALECT_HOST,
    port: process.env.DIALECT_PORT,
    username: process.env.DIALECT_USERNAME,
    password: process.env.DIALECT_PASSWORD,
    database: process.env.DIALECT_DATABASE,
};

export var dialectConfig: DialectConfig = merge(baseConfig, envConfig);
