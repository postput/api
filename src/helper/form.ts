import Logger from "../logger";
import {FileType, Upload} from "../upload/model";
import * as fileType from "file-type";
import * as multiparty from 'multiparty';
import {values} from 'lodash';
import {lookup, extension } from 'mime-types';

export class FormHelper{
    static async getBuffers(request){
        return new Promise((resolve, reject) => {
            const uploads : any = {};
            const form = new multiparty.Form();

            let nameOverrides : any = request.query['name-overrides'] || '{}';
            nameOverrides = JSON.parse(nameOverrides);

            form.on('error', (error)=> {
                Logger.error(error);
                reject(error);
            });

            form.on('part', async (part) =>{

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
                            let ft : any = fileType(data);
                            if(!ft){
                                ft = FormHelper.guessFileType(part);
                            }
                            const fileTypeResult = FileType.fromFileType(ft);
                            upload.fieldName = part.name;
                            upload.originalName = part.filename;
                            upload.nameOverride = nameOverrides[part.name] || request.query['name-override'] ;
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

    static guessFileType(part){
        const fileName = part.filename;
        const type= {
            ext: 'unknown',
            mime: 'application/octet-stream'
        };
        if(fileName){

            const defaultExtension = fileName.substr(fileName.lastIndexOf('.') + 1);
            if(defaultExtension){
                type.ext= defaultExtension;
            }
            const mime = lookup(fileName);
            const ext = extension(fileName);

            if(mime){
                type.mime = mime
            }
            if(ext){
                type.ext = ext
            }
        }
        return type;
    }
}
