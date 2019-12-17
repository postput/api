import {ProviderService} from "../provider/service";
import {WebhookService} from "../webhook/service";
import {ProviderBuilder} from "../provider/builder";

export class DeleteService {

    private static pInstance: DeleteService;

    static get instance(): DeleteService {
        return DeleteService.getInstance();
    }

    private static getInstance() {
        if (!DeleteService.pInstance) {
            DeleteService.pInstance = new DeleteService();
        }
        return DeleteService.pInstance;
    }


    async delete(req, res) {
        const providerInstance = await ProviderService.instance.findByRequest(req);
        const provider = ProviderBuilder.instance.build(providerInstance);
        res.status(200);
        await provider.delete(req, res);
        res.end();
        await WebhookService.instance.send(providerInstance, req);
    }
}
