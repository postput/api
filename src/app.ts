import * as express from "express";
require('express-async-errors');
import { Env } from "./helper/env";
import { SequelizeBuilder } from './sequelizeBuilder'
import {Fixtures} from "./fixtures";

import * as winston from "winston";
import * as morgan from "morgan";
import Logger from "./logger";
import {sequelizeConfig} from "./config/sequelize";
import {HealthCheckRoute} from "./health-check/route";
import {DownloadController} from "./download/controller";
import {DownloadRoute} from "./download/route";
import {UploadRoute} from "./upload/route";
import {StorageService} from "./storage/service";
import appConfig from "./config/app";
const cors = require('cors');
const boolParser = require('express-query-boolean');
const intParser = require('express-query-int');


export default class App {

    private static appInstance: App;
    public server;

    static get instance() : App {
        return App.getInstance();
    }


    public express: express.Application = express();
    public healthCheckRoute = new HealthCheckRoute();
    public downloadRoute = new DownloadRoute();
    public uploadRoute = new UploadRoute();

    private constructor(){
        this.healthCheckRoute.routes(this.express);
        this.downloadRoute.routes(this.express);
        this.uploadRoute.routes(this.express);


        this.express.use((err, req, res, next) => {
            Logger.error(err);
            let statusCode = 500;

            if(err.statusCode){
                statusCode = err.statusCode;
            }

            if(err.output && err.output.statusCode){
                statusCode = err.output.statusCode;
            }

            if(Env.isInProduction()) {
                return res.status(statusCode).send(`something wen't wrong`);
            }

            return res.status(statusCode).send(err.stack);
        })

    }

     private static getInstance() {
        if (!App.appInstance) {
            App.appInstance = new App();
        }
        return App.appInstance;
    }

    async init(){
        process.on('uncaughtException', function(err) {
            Logger.error(err);
        });
        process.on('unhandledRejection', function(err) {
            Logger.error(err);
        });

        this.express.use(morgan('combined', { stream: {write: Logger.morganLog} }));
        await SequelizeBuilder.sequelize.sync({ force: sequelizeConfig.forceSync });
        await Fixtures.load();
        await StorageService.instance.init();
        Logger.log('database created');
        this.express.use(cors());
        this.express.use(boolParser());
        this.express.use(intParser());

        return this;
    }

    async run(){
        await this.init();
        this.server = this.express.listen(appConfig.listen_port, () => console.log("Server running on "+ appConfig.listen_port +"!"));
    }

}
