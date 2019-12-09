import {Application} from "express";
import {DeleteController} from "./controller";
import {json, raw, text, urlencoded} from 'body-parser';

export class DeleteRoute {

    public deleteController: DeleteController = new DeleteController();

    public routes(app: Application): void {
        app.route('/*')
            .delete(this.deleteController.delete);
    }
}
