import {
    AllowNull,
    AutoIncrement, BelongsTo,
    Column, CreatedAt,
    DataType, DeletedAt,
    ForeignKey, HasMany,
    IsUUID,
    Model,
    PrimaryKey, Table,
    Unique, UpdatedAt
} from "sequelize-typescript";
import {date, identifier, list, object, serializable} from "serializr";
import {Webhook} from "../webhook/model";
import {Download} from "../download/model";
import {Upload} from "../upload/model";
import {readdirSync} from "fs";
import {join} from "path";
import {Async} from "../helper/async";
import {ProviderService} from "./service";

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
    download(req, res): Promise<Download>;
    upload(req, res): Promise<Upload[]>;
    delete(req, res): Promise<void>;
}

export class ProviderBuilder{
    private static pInstance: ProviderBuilder;
    providerClasses : any[];

    providers : Provider[] = [];

    static get instance(): ProviderBuilder {
        return ProviderBuilder.getInstance();
    }

    private static getInstance() {
        if (!ProviderBuilder.pInstance) {
            ProviderBuilder.pInstance = new ProviderBuilder();
        }
        return ProviderBuilder.pInstance;
    }

    async init() {
        const files = readdirSync(join(__dirname, 'implementation'));
        const providersPromises = files.map(async file => {
            const module =  await import(join(__dirname, 'implementation', file));
            return module.default;
        });
        this.providerClasses =  await Promise.all(providersPromises);

        const providerInstances = await ProviderService.instance.findAll();
        await Async.foreach(providerInstances, async providerInstance => {
            const provider = this.build(providerInstance);
            await provider.init();
        });

    }

    build(instance: ProviderInstance): Provider{
        if(instance.id && this.providers[instance.id]){
            return this.providers[instance.id];
        }

        const Provider = this.providerClasses.find(provider => provider.type === instance.type);
        if(Provider){
            this.providers[instance.id] = new Provider(instance);
            return this.providers[instance.id];
        }
        throw Error('Provider "'+ instance.type + '" not implemented.');
    }
}

@Table({tableName: 'provider', modelName: 'Provider'})
export class ProviderInstance extends Model<ProviderInstance>{

    @serializable(identifier())
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @serializable
    @Unique
    @AllowNull(false)
    @Column
    name: string;

    @serializable(list(object(Webhook)))
    @HasMany(() => Webhook)
    webhooks: Webhook[];

    @serializable
    @AllowNull(false)
    @Column
    type: string;

    @serializable
    @AllowNull(false)
    @Column({
        defaultValue: false
    })
    isDefault: boolean;


    @Column({
        type: DataType.JSON,
        defaultValue: {}
    })
    config: ProviderConfig;

    @serializable(date())
    @CreatedAt
    creationDate: Date;

    @serializable(date())
    @UpdatedAt
    updatedOn: Date;

    @DeletedAt
    deletionDate: Date;
};

