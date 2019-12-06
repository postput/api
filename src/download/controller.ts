import {DownloadService} from "../download/service";

export class DownloadController {


    async get(req, res) {
        return DownloadService.instance.get(req, res);
    }

}
