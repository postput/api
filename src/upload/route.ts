import {Application} from "express";
import {UploadController} from "./controller";
export class UploadRoute {

    public uploadController: UploadController = new UploadController();

    public routes(app: Application): void {
        app.route('/*')
            .post(this.uploadController.post)
            .put(this.uploadController.put);
    }
}
