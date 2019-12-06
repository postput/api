export interface EnvironmentConstantConfig
{
    PRODUCTION: string;
    DEVELOPMENT: string;
}

export interface ConstantConfig
{
    ENVIRONMENT: EnvironmentConstantConfig;
}

const constant : ConstantConfig = require('./json/constant.json');

export default constant;
