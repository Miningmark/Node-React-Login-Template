import { Table, Column, Model, DataType, PrimaryKey, AllowNull, ForeignKey, BelongsTo, Default } from "sequelize-typescript";
import User from "@/models/user.model";

export enum UserTokenType {
    REFRESH_TOKEN = "refreshToken",
    ACCESS_TOKEN = "accessToken",
    USER_REGISTRATION_TOKEN = "userRegistration",
    ADMIN_REGISTRATION_TOKEN = "adminRegistration",
    PASSWORD_RESET_TOKEN = "passwordReset",
    ACCOUNT_REACTIVATION_TOKEN = "accountReactivation"
}

interface UserTokenAttributes {
    userId: number;
    type: UserTokenType;
    token: string;
    expiresAt: Date | null;
}

@Table({
    tableName: "user_tokens",
    timestamps: false
})
class UserToken extends Model<UserToken, UserTokenAttributes> {
    @PrimaryKey
    @ForeignKey(() => User)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    userId!: number;

    @PrimaryKey
    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(UserTokenType)))
    type!: UserTokenType;

    @AllowNull(false)
    @Column(DataType.TEXT)
    token!: string;

    @AllowNull(true)
    @Column(DataType.DATE)
    expiresAt!: Date;

    @BelongsTo(() => User, {
        onDelete: "CASCADE"
    })
    user!: User;
}

export default UserToken;
