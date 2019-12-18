import {Request, Response} from "express";
import {Readable} from "stream";
import {Operation} from "./interface";
import {forOwn} from 'lodash';
import {OperationBuilder} from "./builder";

export abstract class BaseOperation implements Operation {
    request: Request;
    response: Response;

    constructor(request: Request, response: Response) {
        this.request = request;
        this.response = response;
    }

    get value() {
        const types = this.getTypes();
        let returnValue = null;
        types.forEach(type => {
            forOwn(this.request.query, (value, key) => {
                if( key === type) returnValue = value;
                return null;
            });
        });
        return returnValue;
    }

    getTypes(): string[] {
        return [];
    }

    async apply(readable: Readable): Promise<Readable> {
        return readable;
    }
    
}