import Logger from "../logger";
import {FileType, Upload} from "../upload/model";
import * as fileType from "file-type";
import * as multiparty from 'multiparty';
import {values} from 'lodash';

export class FormHelper{
    static async getBuffers(request){
        return new Promise((resolve, reject) => {
            const uploads : any = {};
            const form = new multiparty.Form();

            form.on('error', (error)=> {
                Logger.error(error);
                reject(error);
            });

            form.on('part', (part) =>{

                if (!part.filename) {
                    // filename is not defined when this is a field and not a file
                    console.log('got field named ' + part.name);
                    // ignore field's content
                    part.resume();
                }

                if (part.filename) {
                    // filename is defined when this is a file
                    console.log('got file named ' + part.name);
                    part.on('data', data => {
                        if(!uploads[part.name]){
                            const upload = new Upload();
                            const fileTypeResult = FileType.fromFileType(fileType(data));
                            upload.fieldName = part.name;
                            upload.originalName = part.filename;
                            upload.type = fileTypeResult;
                            upload.data = data;
                            uploads[part.name] = upload;
                        }else{
                            uploads[part.name].data = Buffer.concat([uploads[part.name].data, data]);
                        }
                    });
                    part.resume();
                }

                part.on('error', (error) => {
                    Logger.error(error);
                    reject(error);
                });
            });
            form.on('close', () =>{
                console.log('Upload completed!');
                resolve(values(uploads));
            });
            form.parse(request);
        });
    }
}
