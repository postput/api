import {expect} from 'chai';
import {before, describe, it} from 'mocha'
import {v4} from 'uuid';
import {UploadServiceTest} from "../upload";
import {ProviderService} from "../../src/provider/service";

describe('Upload to FTP',
    function () {
        this.timeout(100000);
        const uuid = v4();
        const nameOverride = uuid + '.jpeg';
        const filePath = 'test/data/test.jpeg';
        let storage;

        before(async () => {
            storage = await ProviderService.instance.findByName('my_ftp_files');
        });

        it('Should upload '+ nameOverride +' to FTP', async function () {
            const upload = await UploadServiceTest.instance.singleUpload(storage, filePath, nameOverride);
            expect(upload.type.extension).to.equal('jpg');
        });

        it('Should download '+ nameOverride +' from FTP', async function () {
            const response = await UploadServiceTest.instance.download(storage, nameOverride);
        });

        it('Should delete '+ nameOverride +' from FTP', async function () {
            const response = await UploadServiceTest.instance.delete(storage, nameOverride);
        });

    });