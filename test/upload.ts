import app from "../src/app";
import {deserialize} from "serializr";
import {Upload} from "../src/upload/model";
import {expect} from "chai";
import * as request from 'supertest';
import {join} from 'path';

export class UploadServiceTest {

    private static pInstance: UploadServiceTest;

    static get instance(): UploadServiceTest {
        return UploadServiceTest.getInstance();
    }

    private static getInstance() {
        if (!UploadServiceTest.pInstance) {
            UploadServiceTest.pInstance = new UploadServiceTest();
        }
        return UploadServiceTest.pInstance;
    }

    async singleUpload(storage, filePath, nameOverride) {
        const response = await request(app.instance.express)
            .post('/'+ storage.name +'?name-override='+ nameOverride)
            .attach('avatar', filePath)
            .expect('content-type', /json/)
            .expect(200);
        const uploads = deserialize(Upload, response.body);
        const upload : Upload = uploads[0];
        expect(upload.fieldName).to.equal('avatar');
        expect(upload.fileName).to.equal(nameOverride);
        expect(upload.nameOverride).to.equal(nameOverride);
        expect(upload.urls[0]).to.include(storage.name +'/'+ nameOverride);
        return upload;
    }

    async download (storage, fileName, queryString?) {
        let fullUrl = join('/', storage.name, fileName);
        if(queryString){
            fullUrl += '?' +queryString;
        }
        const response = await request(app.instance.express)
            .get(fullUrl)
            .expect(200);
        return response;
    }

    async downloadUrl (storage, url) {

        const fullURL = join('/', storage.name ) + '?url='+ encodeURI(url);
        const response = await request(app.instance.express)
            .get(fullURL)
            .expect(200);
        return response;
    }

    async delete (storage, fileName, queryString?) {
        let fullUrl = join('/', storage.name, fileName);
        if(queryString){
            fullUrl += '?' +queryString;
        }
        const response = await request(app.instance.express)
            .delete(fullUrl)
            .expect(200);
        return response;
    }

}