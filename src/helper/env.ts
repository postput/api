import appConfig from '../config/app';

export class Env{

    constructor(){}

    static isInDevelopment(){
        return appConfig.env === 'development';
    }

    static isInProduction(){
        return appConfig.env === 'production';
    }
}
