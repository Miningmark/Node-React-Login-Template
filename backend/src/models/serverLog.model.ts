import {
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute
} from "@sequelize/core";
import {
    Attribute,
    AutoIncrement,
    Default,
    NotNull,
    PrimaryKey,
    Table
} from "@sequelize/core/decorators-legacy";

import User from "@/models/user.model.js";

export enum ServerLogTypes {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}

@Table({
    tableName: "server_logs",
    timestamps: false
})
class ServerLog extends Model<InferAttributes<ServerLog>, InferCreationAttributes<ServerLog>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    @NotNull
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.ENUM(...Object.values(ServerLogTypes)))
    @NotNull
    declare type: ServerLogTypes;

    @Attribute(DataTypes.TEXT)
    @NotNull
    message!: string;

    @Attribute(DataTypes.INTEGER)
    declare userId: number | null;

    @Attribute(DataTypes.STRING)
    declare url: string | null;

    @Attribute(DataTypes.STRING)
    declare method: string | null;

    @Attribute(DataTypes.INTEGER)
    declare status: number | null;

    @Attribute(DataTypes.STRING)
    declare ipv4Address: string | null;

    @Attribute(DataTypes.STRING)
    declare userAgent: string | null;

    @Attribute(DataTypes.JSON)
    declare requestBody: string | null;

    @Attribute(DataTypes.JSON)
    declare requestHeaders: string | null;

    @Attribute(DataTypes.JSON)
    declare response: string | null;

    @Attribute(DataTypes.STRING)
    declare source: string | null;

    @Attribute(DataTypes.TEXT)
    declare errorStack: string | null;

    @Attribute(DataTypes.DATE)
    @Default(DataTypes.NOW)
    @NotNull
    declare createdAt: CreationOptional<Date>;

    declare user?: NonAttribute<User>;

    declare getUser: BelongsToGetAssociationMixin<User>;
    declare setUser: BelongsToSetAssociationMixin<User, number>;
}

export default ServerLog;
