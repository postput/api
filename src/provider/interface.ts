import {Download} from "../download/model";
import {Upload} from "../upload/model";
import {ProviderInstance} from "./model";

export interface ProviderConfig {
    allowUpload: boolean;
    maxUploadSize: number | undefined;
    urls: string[];
    custom: any;
}

export interface Provider {
    instance: ProviderInstance;
    defaultConfig: ProviderConfig;

    init(): Promise<void>;

    getType(): string;

    download(req, res): Promise<Download>;

    upload(req, res): Promise<Upload[]>;

    delete(req, res): Promise<void>;
}