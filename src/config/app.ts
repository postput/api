import {merge} from "lodash";

export interface AppConfig
{
    listen_port: number;
    env: string;
    urls: string[];
}

const baseConfig = require('./json/app.json');

const envConfig = {
    listen_port: process.env.LISTEN_PORT,
    env: process.env.ENV,
    urls:[]
};

if(process.env.URLS){
    envConfig.urls = JSON.parse(process.env.URLS);
}

const appConfig : AppConfig = merge(baseConfig, envConfig);
export default  appConfig ;
