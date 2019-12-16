import {
    AllowNull,
    AutoIncrement, BelongsTo, BelongsToMany,
    Column,
    CreatedAt,
    DataType, DeletedAt, ForeignKey, IsUUID,
    Model,
    PrimaryKey,
    Table,
    Unique, UpdatedAt
} from "sequelize-typescript";
import {date, identifier, list, object, serializable} from "serializr";
import {ProviderInstance} from "../provider/model";

@Table
export class WebhookType extends Model<WebhookType>{
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

    @serializable
    @Unique
    @AllowNull(true)
    @Column
    description: string;

    @BelongsToMany(() => Webhook, () => WebhookTypes)
    webhooks: Webhook[];

    @Column({
        type: DataType.JSON,
        defaultValue: {}
    })
    config: any;

    @Column({
        type: DataType.JSON,
        defaultValue: {}
    })
    data: any;

    @serializable(date())
    @CreatedAt
    creationDate: Date;

    @serializable(date())
    @UpdatedAt
    updatedOn: Date;

    @DeletedAt
    deletionDate: Date;
}



@Table
export class WebhookTypes extends Model<WebhookTypes> {

    @PrimaryKey
    @ForeignKey(() => Webhook)
    @Column
    webhookId: number;

    @PrimaryKey
    @ForeignKey(() => WebhookType)
    @Column
    webhookTypeId: number;
}

@Table
export class Webhook extends Model<Webhook>{
    @serializable(identifier())
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @serializable(list(object(WebhookType)))
    @BelongsToMany(() => WebhookType, () => WebhookTypes)
    webhookTypes: WebhookType[];

    @serializable
    @ForeignKey(() => ProviderInstance)
    @AllowNull(false)
    @Column
    storageId: number;

    //@serializable(object(ProviderInstance))
    @BelongsTo(() => ProviderInstance)
    storage: ProviderInstance;
    
    @serializable
    @Unique
    @AllowNull(false)
    @Column
    name: string;

    @serializable
    @Unique
    @AllowNull(true)
    @Column
    description: string;

    @IsUUID(4)
    @Unique
    @AllowNull(false)
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        comment: 'token for webhook',
    })
    token: string;
    
    @Column({
        type: DataType.JSON,
        defaultValue: {}
    })
    config: any;

    @Column({
        type: DataType.JSON,
        defaultValue: {}
    })
    data: any;

    @serializable(date())
    @CreatedAt
    creationDate: Date;

    @serializable(date())
    @UpdatedAt
    updatedOn: Date;

    @DeletedAt
    deletionDate: Date;
}