import * as winston from "winston";
import appConfig from "./config/app";
import constant from "./config/constant";
import * as PrettyError from "pretty-error";


export default class Logger {

    private static loggerInstance: Logger;
    private static levelMapping = {};


    public logger: winston.Logger;

    static get instance(): Logger {
        return Logger.getInstance();
    }

    private constructor() {
        Logger.levelMapping[constant.ENVIRONMENT.DEVELOPMENT] = 'silly';
        Logger.levelMapping[constant.ENVIRONMENT.PRODUCTION] = 'info';
        this.config();

    }

    private static getInstance() {
        if (!Logger.loggerInstance) {
            Logger.loggerInstance = new Logger();
        }
        return Logger.loggerInstance;
    }

    private config(): void {
        const self = this;

        this.logger = winston.createLogger({
            level: self.getLevel(),
            format: winston.format.json(),

            transports: [
                new winston.transports.Console({
                    format: winston.format.simple(),
                    handleExceptions: true,
                    level: self.getLevel()
                })
            ]
        });
        this.logger.exitOnError = false;
    }

    static morganLog(message, encoding) {
        Logger.log(message);
    }

    static sequelizeLog(message) {
        Logger.log(message);
    }


    static getPrettyError() : PrettyError{
        const prettyError = new PrettyError();
        prettyError.appendStyle({
            'pretty-error > header > message': {
                color: 'white'
            },
            'pretty-error > trace > item': {
                marginBottom: 0,
                marginTop: 0
            }
        });
        return prettyError;
    }

    static error(err) {
        Logger.log(Logger.getPrettyError().render(err), 'error');
    }

    static log(message: string, level?:string){
        const l = level || Logger.instance.getLevel();
        Logger.instance.logger.log(l, message);
    }

    private getLevel() {
        return Logger.levelMapping[appConfig.env] || 'info';
    }
}
