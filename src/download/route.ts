import {Application} from "express";
import {DownloadController} from "./controller";
import * as bodyParser from "body-parser";
export class DownloadRoute {

    public downloadController: DownloadController = new DownloadController();

    public routes(app: Application): void {
        app.route('/*')
            .get(bodyParser.urlencoded({ extended: false }), this.downloadController.get);
    }
}
