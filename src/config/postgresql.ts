import {merge} from 'lodash';

export interface PostgresqlConfig
{
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
}

const baseConfig = require('./json/postgresql.json');

const envConfig = {
    host: process.env.POSTGRESQL_HOST,
    port: process.env.POSTGRESQL_PORT,
    username: process.env.POSTGRESQL_USERNAME,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DATABASE,
};

export var postgresqlConfig: PostgresqlConfig = merge(baseConfig, envConfig);
