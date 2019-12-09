import {expect} from 'chai';
import {before, describe, it} from 'mocha'
import {v4} from 'uuid';
import {UploadServiceTest} from "../upload";
import {StorageService} from "../../src/storage/service";

describe('Upload to Backblaze',
    function () {
        this.timeout(100000);
        const uuid = v4();
        const nameOverride = uuid + '.jpeg';
        const filePath = 'test/data/test.jpeg';
        let storage;

        before(async () => {
            storage = await StorageService.instance.findByName('my_backblaze_files');
        });

        it('Should upload '+ nameOverride +' to Backblaze', async function () {
            const upload = await UploadServiceTest.instance.singleUpload(storage, filePath, nameOverride);
            expect(upload.type.extension).to.equal('jpg');
        });

        it('Should download and delete '+ nameOverride +' from Backblaze', async function () {
            const response = await UploadServiceTest.instance.download(storage, nameOverride);
            const fileId = response.header['x-bz-file-id'];
            const responseDelete = await UploadServiceTest.instance.delete(storage, nameOverride, {fileId});

        });



    });