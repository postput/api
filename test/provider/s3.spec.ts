import {expect} from 'chai';
import {before, describe, it} from 'mocha'
import {v4} from 'uuid';
import {UploadServiceTest} from "../upload";
import {ProviderService} from "../../src/provider/service";

describe('Upload to Amazon s3',
    function () {
        this.timeout(100000);
        const uuid = v4();
        const nameOverride = uuid + '.jpeg';
        const filePath = 'test/data/test.jpeg';
        let storage;

        before(async () => {
            storage = await ProviderService.instance.findByType('s3');
        });

        it('Should upload '+ nameOverride +' to Amazon S3', async function () {
            const upload = await UploadServiceTest.instance.singleUpload(storage, filePath, nameOverride);
            expect(upload.type.extension).to.equal('jpg');
        });

        it('Should download '+ nameOverride +' from Amazon S3', async function () {
            const response = await UploadServiceTest.instance.download(storage, nameOverride);
        });

        it('Should delete '+ nameOverride +' from Amazon S3', async function () {
            const response = await UploadServiceTest.instance.delete(storage, nameOverride);
        });

    });