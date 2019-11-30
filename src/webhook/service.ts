import {Storage} from '../storage/model'
import {isEmpty, merge} from "lodash";
import * as request from "request-promise";

export class WebhookService {

    private static pInstance: WebhookService;

    static get instance(): WebhookService {
        return WebhookService.getInstance();
    }

    private static getInstance() {
        if (!WebhookService.pInstance) {
            WebhookService.pInstance = new WebhookService();
        }
        return WebhookService.pInstance;
    }

    send(storage: Storage, req){
        const webhooks = storage.webhooks;
        if(!isEmpty(webhooks)){
            const calls = [];
            webhooks.forEach(webhook => {
                webhook.config.urls.forEach(url =>{
                    webhook.webhookTypes.forEach(webhookType => {
                        let triggerMethods = webhook.config.triggerMethods || [];
                        triggerMethods = triggerMethods.concat(webhookType.config.triggerMethods);
                        if (triggerMethods.indexOf(req.method) > -1){
                            let opts : any = webhookType.config.opts;
                            opts = merge(opts, webhook.config.opts);
                            opts.uri = url;
                            calls.push(request(opts));
                        }
                    });
                });
            });
            return Promise.all<any>(calls);
        }
    }
}