import { Table, Column, Model, DataType, PrimaryKey, AllowNull, AutoIncrement, ForeignKey, BelongsTo, Default } from "sequelize-typescript";
import User from "@/models/user.model";

export enum ServerLogLevels {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}

interface ServerLogAttributes {
    id?: number;
    level: ServerLogLevels;
    message: string;
    userId?: number;
    url?: string;
    method?: string;
    status?: number;
    ipv4Address?: string;
    userAgent?: string;
    requestBody?: JSON;
    requestHeaders?: JSON;
    response?: JSON;
    source?: string;
    errorStack?: string;
    timestamp?: string;
}

@Table({
    tableName: "serverLogs",
    timestamps: false
})
class ServerLog extends Model<ServerLog, ServerLogAttributes> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id!: number;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(ServerLogLevels)))
    level!: ServerLogLevels;

    @AllowNull(false)
    @Column(DataType.TEXT)
    message!: string;

    @ForeignKey(() => User)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    userId!: number;

    @AllowNull(true)
    @Column(DataType.STRING)
    url!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    method!: string;

    @AllowNull(true)
    @Column(DataType.INTEGER)
    status!: number;

    @AllowNull(true)
    @Column(DataType.STRING)
    ipv4Address!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    userAgent!: string;

    @AllowNull(true)
    @Column(DataType.JSON)
    requestBody!: JSON;

    @AllowNull(true)
    @Column(DataType.JSON)
    requestHeaders!: JSON;

    @AllowNull(true)
    @Column(DataType.JSON)
    response!: JSON;

    @AllowNull(true)
    @Column(DataType.STRING)
    source!: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    errorStack!: string;

    @AllowNull(false)
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    timestamp!: Date;

    @BelongsTo(() => User, {
        onDelete: "CASCADE"
    })
    user!: User;
}

export default ServerLog;
