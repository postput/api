import {Async} from "../helper/async";
import {OperationBuilder} from "./builder";
import {Request, Response} from "express";
import {forOwn} from 'lodash';

export class OperationService {

    private static pInstance: OperationService;

    static get instance(): OperationService {
        return OperationService.getInstance();
    }

    private static getInstance() {
        if (!OperationService.pInstance) {
            OperationService.pInstance = new OperationService();
        }
        return OperationService.pInstance;
    }

    async applyOperations(download, request: Request, response: Response){
        const operations = [];

        forOwn(request.query, (value, key)=> {
            const operation = OperationBuilder.instance.build(key, request, response);
            if(operation){
                operations.push(operation);
            }
        });
        
        await Async.foreach(operations, async operation => {
            const newData = await operation.apply(download.data);
            if(newData !== null){
                download.data = newData;
            }
        });
        return download;
    }
}
