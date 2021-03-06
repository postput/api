import {expect} from 'chai';
import {before, describe, it} from 'mocha'
import {v4} from 'uuid';
import {UploadServiceTest} from "../upload";
import {ProviderService} from "../../src/provider/service";

describe('Upload to filesystem',
    function () {
        this.timeout(100000);
        const uuid = v4();
        const nameOverride = uuid + '.jpeg';
        const nameOverrideAvi = uuid + '.avi';
        const nameOverrideMp3 = uuid + '.mp3';

        const filePath = 'test/data/test.jpeg';
        const filePathAvi = 'test/data/test.avi';
        const filePathMp3 = 'test/data/test.mp3';
        let storage;

        before(async () => {
            storage = await ProviderService.instance.findByName('my_filesystem_files');
        });

        it('Should upload '+ nameOverride +' to filesystem', async function () {
            let upload;
            upload = await UploadServiceTest.instance.singleUpload(storage, filePath, nameOverride);
            expect(upload.type.extension).to.equal('jpg');
            upload = await UploadServiceTest.instance.singleUpload(storage, filePathAvi, nameOverrideAvi);
            expect(upload.type.extension).to.equal('avi');
            upload = await UploadServiceTest.instance.singleUpload(storage, filePathMp3, nameOverrideMp3);
            expect(upload.type.extension).to.equal('mp3');
        });

        it('Should download '+ nameOverride +' from filesystem', async function () {
            const response = await UploadServiceTest.instance.download(storage, nameOverride);
        });

        it('Should download '+ nameOverride +' from filesystem with operations', async function () {
             await UploadServiceTest.instance.download(storage, nameOverride, 'face=true&face-pad=1.5&resize=200,200&saturate=0.6&&brightness=10&colorspace=cmyk&flip-x=true&flip-y=true&grayscale=true&hue=90&negate=true&tint=210,210,105,1&rotate=90&mask=elipse&blur=5&format=webp');
        });

        it('Should download '+ nameOverrideAvi +' from filesystem with operations', async function () {
            await UploadServiceTest.instance.download(storage, nameOverrideAvi, 'extract=2,2&resize-video=900x600&crop-video=300:200:50:30');
        });

        it('Should download '+ nameOverrideMp3 +' from filesystem with operations', async function () {
            await UploadServiceTest.instance.download(storage, nameOverrideMp3, 'extract=2,60');
        });

        it('Should download jpeg '+ nameOverride , async function () {
            await UploadServiceTest.instance.download(storage, nameOverride, 'format=jpeg');
        });

        it('Should download jpg '+ nameOverride , async function () {
            const response = await UploadServiceTest.instance.download(storage, nameOverride, 'format=jpg');
        });

        it('Should download png '+ nameOverride , async function () {
            const response = await UploadServiceTest.instance.download(storage, nameOverride, 'format=png');
        });

        it('Should download tiff '+ nameOverride , async function () {
            const response = await UploadServiceTest.instance.download(storage, nameOverride, 'format=tiff');
        });
        
        it('Should download raw '+ nameOverride , async function () {
            const response = await UploadServiceTest.instance.download(storage, nameOverride, 'format=raw');
        });

        it('Should delete '+ nameOverride +' from filesystem', async function () {
            await UploadServiceTest.instance.delete(storage, nameOverride);
            await UploadServiceTest.instance.delete(storage, nameOverrideAvi);
            await UploadServiceTest.instance.delete(storage, nameOverrideMp3);
        });

    });