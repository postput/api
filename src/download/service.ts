import {ProviderService} from "../provider/service";
import {ProviderBuilder} from '../provider/model';
import {OperationService} from "../operation/service";
import {WebhookService} from "../webhook/service";

export class DownloadService{

    private static pInstance: DownloadService;

    static get instance() : DownloadService {
        return DownloadService.getInstance();
    }

    private static getInstance() {
        if (!DownloadService.pInstance) {
            DownloadService.pInstance = new DownloadService();
        }
        return DownloadService.pInstance;
    }


    async get(req, res){
        const providerInstance = await ProviderService.instance.findByRequest(req);

        const provider = ProviderBuilder.instance.build(providerInstance);

        const download = await provider.download(req, res);

        await OperationService.instance.applyOperations(download, req, res);

        download.data.pipe(res);
        await WebhookService.instance.send(providerInstance, req);
    }
}
