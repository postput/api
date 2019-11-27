import {Application} from "express";
import {DownloadController} from "./controller";
import * as bodyParser from "body-parser";
const intParser = require('express-query-int');
const boolParser = require('express-query-boolean');
export class DownloadRoute {

    public downloadController: DownloadController = new DownloadController();

    public routes(app: Application): void {
        app.route('/*')
            .get(bodyParser.urlencoded({ extended: false }), intParser(), boolParser(), this.downloadController.get);
    }
}
