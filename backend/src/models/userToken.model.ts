import User from "@/models/user.model.js";
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
import { Attribute, Default, NotNull, PrimaryKey, Table } from "@sequelize/core/decorators-legacy";

export enum UserTokenType {
    REFRESH_TOKEN = "refreshToken",
    ACCESS_TOKEN = "accessToken",
    USER_REGISTRATION_TOKEN = "userRegistration",
    ADMIN_REGISTRATION_TOKEN = "adminRegistration",
    PASSWORD_RESET_TOKEN = "passwordReset",
    ACCOUNT_REACTIVATION_TOKEN = "accountReactivation"
}

@Table({
    tableName: "user_tokens",
    timestamps: false
})
class UserToken extends Model<InferAttributes<UserToken>, InferCreationAttributes<UserToken>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @NotNull
    declare userId: CreationOptional<number>;

    @Attribute(DataTypes.ENUM(...Object.values(UserTokenType)))
    @PrimaryKey
    @NotNull
    declare type: UserTokenType;

    @Attribute(DataTypes.TEXT)
    @NotNull
    declare token: string;

    @Attribute(DataTypes.DATE)
    @Default(DataTypes.NOW)
    declare expiresAt: CreationOptional<Date> | null;

    declare user: NonAttribute<User>;

    declare getUser: BelongsToGetAssociationMixin<User>;
    declare setUser: BelongsToSetAssociationMixin<User, number>;
}

export default UserToken;
