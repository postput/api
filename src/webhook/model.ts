import {
    AllowNull,
    AutoIncrement,
    Column,
    CreatedAt,
    DataType, DeletedAt,
    Model,
    PrimaryKey,
    Table,
    Unique, UpdatedAt
} from "sequelize-typescript";
import {date, identifier, serializable} from "serializr";

@Table
export class Webhook extends Model<Webhook>{
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