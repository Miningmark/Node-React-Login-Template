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
import { Attribute, AutoIncrement, Default, NotNull, PrimaryKey, Table } from "@sequelize/core/decorators-legacy";

@Table({
    tableName: "last_logins",
    timestamps: false
})
class LastLogin extends Model<InferAttributes<LastLogin>, InferCreationAttributes<LastLogin>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    @NotNull
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare userId: number;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare ipv4Address: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare userAgent: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare country: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare regionName: string;

    @Attribute(DataTypes.DATE)
    @Default(DataTypes.NOW)
    @NotNull
    declare loginTime: CreationOptional<Date>;

    @Attribute(DataTypes.BOOLEAN)
    @Default(false)
    @NotNull
    declare successfully: CreationOptional<boolean>;

    declare user: NonAttribute<User>;

    declare getUser: BelongsToGetAssociationMixin<User>;
    declare setUser: BelongsToSetAssociationMixin<User, number>;
}

export default LastLogin;
