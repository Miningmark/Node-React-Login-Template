import { Table, Column, Model, DataType, PrimaryKey, AllowNull, AutoIncrement, ForeignKey, BelongsTo, Default } from "sequelize-typescript";
import User from "@/models/user.model";

export interface UserLastLoginAttributes {
    id?: number;
    userId: number;
    ipv4Address: string;
    userAgent?: string;
    country: string;
    regionName: string;
    loginTime: Date;
    successfully: boolean;
}

@Table({
    tableName: "user_last_logins",
    timestamps: false
})
class UserLastLogin extends Model<UserLastLogin, UserLastLoginAttributes> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id!: number;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    userId!: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    ipv4Address!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    userAgent!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    country!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    regionName!: string;

    @AllowNull(false)
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    loginTime!: Date;

    @AllowNull(false)
    @Default(false)
    @Column(DataType.BOOLEAN)
    successfully!: boolean;

    @BelongsTo(() => User, {
        onDelete: "CASCADE"
    })
    user!: User;
}

export default UserLastLogin;
