import {
    AllowNull,
    AutoIncrement,
    Column,
    CreatedAt,
    DataType,
    DeletedAt,
    HasMany,
    Model,
    PrimaryKey,
    Table,
    Unique,
    UpdatedAt
} from "sequelize-typescript";
import {date, identifier, list, object, serializable} from "serializr";
import {Webhook} from "../webhook/model";
import {ProviderConfig} from "./interface";

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

