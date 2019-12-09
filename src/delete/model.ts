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

export class Delete{
    data: any;
}


