import {list, object, primitive, serializable} from "serializr";

export class FileType{
    @serializable
    extension;
    @serializable
    mime : string;

    static fromFileType(type){
        const fileType = new FileType();
        fileType.extension = type.ext;
        fileType.mime = type.mime;
        return fileType;

    }
}

export class Upload{
    @serializable
    fileName: string;
    @serializable
    fieldName: string;
    @serializable
    originalName: string;
    @serializable
    nameOverride: string;
    @serializable(object(FileType))
    type: FileType;
    @serializable(list(primitive()))
    urls: string[];

    data: any;
}


