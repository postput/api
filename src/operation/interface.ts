import {Readable} from "stream";
import {Request, Response} from "express";

export interface Operation {
    request: Request;
    response: Response;
    getTypes(): string[];
    apply(readable: Readable): Promise<Readable>;
}