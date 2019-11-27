import {expect} from 'chai';
import {before, describe, it} from 'mocha'
import {v4} from 'uuid';
import {UploadServiceTest} from "../upload";
import {StorageService} from "../../src/storage/service";

describe('Upload to filesystem',
    function () {
        this.timeout(100000);
        const uuid = v4();
        const nameOverride = uuid + '.jpeg';
        const filePath = 'test/data/test.jpeg';
        let storage;

        before(async () => {
            storage = await StorageService.instance.findByName('my_filesystem_files');
        });

        it('Should upload '+ nameOverride +' to filesystem', async function () {
            const upload = await UploadServiceTest.instance.singleUpload(storage, filePath, nameOverride);
            expect(upload.type.extension).to.equal('jpg');
        });

        it('Should download '+ nameOverride +' from filesystem', async function () {
            const response = await UploadServiceTest.instance.download(storage, nameOverride);
        });

        it('Should download '+ nameOverride +' from filesystem with operations', async function () {
            const response = await UploadServiceTest.instance.download(storage, nameOverride, 'resize=100,100&rotate=90&mask=elipse&blur=5&format=webp');
        });

        it('Should download '+ nameOverride +' from filesystem with operations', async function () {
            const response = await UploadServiceTest.instance.download(storage, nameOverride, 'format=jpeg');
        });

        it('Should download '+ nameOverride +' from filesystem with operations', async function () {
            const response = await UploadServiceTest.instance.download(storage, nameOverride, 'format=jpg');
        });

        it('Should download '+ nameOverride +' from filesystem with operations', async function () {
            const response = await UploadServiceTest.instance.download(storage, nameOverride, 'format=png');
        });

        it('Should download '+ nameOverride +' from filesystem with operations', async function () {
            const response = await UploadServiceTest.instance.download(storage, nameOverride, 'format=tiff');
        });
        
        it('Should download '+ nameOverride +' from filesystem with operations', async function () {
            const response = await UploadServiceTest.instance.download(storage, nameOverride, 'format=raw');
        });
    });