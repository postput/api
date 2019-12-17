import {ProviderService} from "../provider/service";
import {serialize} from "serializr";
import {URLHelper} from "../helper/url";
import {oc} from "ts-optchain";
import * as request from "request";
import appConfig from "../config/app";
import {entityTooLarge, methodNotAllowed} from '@hapi/boom'
import * as bytes from 'bytes';
import {WebhookService} from "../webhook/service";
import {ProviderBuilder} from "../provider/builder";


export class UploadService {

    private static pInstance: UploadService;

    static get instance(): UploadService {
        return UploadService.getInstance();
    }

    private static getInstance() {
        if (!UploadService.pInstance) {
            UploadService.pInstance = new UploadService();
        }
        return UploadService.pInstance;
    }


    getSize(request){
        return parseInt(request.headers['Content-Length']);
    }

    async post(req, res) {

        const providerInstance = await ProviderService.instance.findByRequest(req);
        const maxUploadSize = oc(providerInstance).config.maxUploadSize(appConfig.max_upload_size || '100mb');

        const bodySize = this.getSize(req);
        const maxSize = bytes.parse(maxUploadSize);

            if(bodySize > maxSize){
                throw entityTooLarge('The body size of this query is too big for this storage "'+ providerInstance.name +'" ('+ bytes(bodySize) +' > '+ maxUploadSize + ')');
            }

            if(providerInstance.config.allowUpload === false) {
                throw methodNotAllowed('Upload is not allowed on this storage. ('+ providerInstance.name +'); To enable upload for this storage, set config.allowUpload = true on this storage.');
            }

            if(req.query.url){
                const response = await this.postURL(req, res);
                response.pipe(res);
                return;
            }
            const provider = ProviderBuilder.instance.build(providerInstance);

            const uploads = await provider.upload(req, res);
            uploads.forEach(upload => {
                upload.urls = URLHelper.getUrls(providerInstance, upload);
            });
            res.json(serialize(uploads)).end();
            await WebhookService.instance.send(providerInstance, req);
    }

    async postURL(req, res){
        const storage = await ProviderService.instance.findByRequest(req);
        const url = req.query.url;
        const readStream = await request({url: url});
        const formData = {
            attachments: readStream
        };
        const remainingQuery = req.query;
        delete remainingQuery.url;
        return request({method: 'POST', url: 'http://localhost:' + appConfig.listen_port + '/' + storage.name, formData: formData, qs: remainingQuery});
    }
}
