import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "@sequelize/core";
import { Attribute, AutoIncrement, Default, NotNull, PrimaryKey, Table } from "@sequelize/core/decorators-legacy";

@Table({
    tableName: "user_notifications",
    timestamps: false
})
class UserNotification extends Model<InferAttributes<UserNotification>, InferCreationAttributes<UserNotification>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    declare notificationId: number;

    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    declare userId: number;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    @Default(false)
    declare confirmed: CreationOptional<boolean>;
}

export default UserNotification;
