import {Application} from "express";
import {DownloadController} from "./controller";
export class DownloadRoute {

    public downloadController: DownloadController = new DownloadController();

    public routes(app: Application): void {
        app.route('/*')
            .get(this.downloadController.get);
    }
}
