import {before, describe, it} from 'mocha'
import {UploadServiceTest} from "../upload";
import {ProviderService} from "../../src/provider/service";

describe('Download from webfolder',
    function () {
        this.timeout(100000);
        const path = 'image4/c1cfec75-e553-4ee9-b998-729eba526f1b.jpeg';
        let storage;

        before(async () => {
            storage = await ProviderService.instance.findByName('my_webfolder_files');
        });


        it('Should download '+ path +' from webfolder', async function () {
            const response = await UploadServiceTest.instance.download(storage, path);
        });

    });