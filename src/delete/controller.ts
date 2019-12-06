import {DeleteService} from "./service";


export class DeleteController {
    async delete(req, res, next) {
        return DeleteService.instance.delete(req, res);
    }
}
