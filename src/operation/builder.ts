import {readdirSync} from "fs";
import {join} from "path";
import {Operation} from "./interface";
import {Request, Response} from "express";

export class OperationBuilder {
    private static pInstance: OperationBuilder;
    operationClasses: any[];

    static get instance(): OperationBuilder {
        return OperationBuilder.getInstance();
    }

    private static getInstance() {
        if (!OperationBuilder.pInstance) {
            OperationBuilder.pInstance = new OperationBuilder();
        }
        return OperationBuilder.pInstance;
    }

    async init() {
        const files = readdirSync(join(__dirname, 'implementation'));
        const providersPromises = files.map(async file => {
            const module = await import(join(__dirname, 'implementation', file));
            return module.default;
        });
        this.operationClasses = await Promise.all(providersPromises);
    }

    build(type: string, request: Request, response: Response): Operation {

        const Operation = this.operationClasses.find(operation =>{
            return operation.prototype.getTypes().includes(type)
        }

        );

        if (Operation) {
            return new Operation(request, response);
        }

        return null;
    }
}