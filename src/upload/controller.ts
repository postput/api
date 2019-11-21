import {serialize} from "serializr";
import {UploadService} from "./service";
export class UploadController {
    async post(req, res) {
        return UploadService.instance.post(req, res);
    }
    
    async put(req, res) {
        return UploadService.instance.post(req, res);
    }
}
