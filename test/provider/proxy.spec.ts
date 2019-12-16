import {before, describe, it} from 'mocha'
import {UploadServiceTest} from "../upload";
import {ProviderService} from "../../src/provider/service";

describe('Download from proxy',
    function () {
        this.timeout(100000);
        const url = 'https://cdn-storage.speaky.com/image4/c1cfec75-e553-4ee9-b998-729eba526f1b.jpeg';
        let storage;

        before(async () => {
            storage = await ProviderService.instance.findByType('proxy');
        });
        

        it('Should download '+ url +' from proxy', async function () {
            const response = await UploadServiceTest.instance.downloadUrl(storage, url);
        });

    });