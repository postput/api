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

@Table
export class StorageType extends Model<StorageType>{
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

    @Column({
        type: DataType.JSONB,
        defaultValue: {}
    })
    config: any;

    @Column({
        type: DataType.JSONB,
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
export class Storage extends Model<Storage>{

    @serializable(identifier())
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @IsUUID(4)
    @Unique
    @AllowNull(false)
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        comment: 'uuid for storage',
    })
    uuid: string;

    @serializable(list(object(Webhook)))
    @HasMany(() => Webhook)
    webhooks: Webhook[];

    @serializable
    @Unique
    @AllowNull(false)
    @Column
    name: string;

    @serializable
    @AllowNull(false)
    @Column({
        defaultValue: false
    })
    isDefault: boolean;
    
    @serializable
    @ForeignKey(() => StorageType)
    @Column
    typeId: number;

    @serializable(object(StorageType))
    @BelongsTo(() => StorageType)
    type: StorageType;

    @Column({
        type: DataType.JSONB
    })
    data: any;

    @Column({
        type: DataType.JSONB,
        defaultValue: {}
    })
    config: any;

    @serializable(date())
    @CreatedAt
    creationDate: Date;

    @serializable(date())
    @UpdatedAt
    updatedOn: Date;

    @DeletedAt
    deletionDate: Date;
};

