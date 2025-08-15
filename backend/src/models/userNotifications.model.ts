import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model
} from "@sequelize/core";
import { Attribute, Default, NotNull, PrimaryKey, Table } from "@sequelize/core/decorators-legacy";

import Notification from "@/models/notification.model.js";
import User from "@/models/user.model.js";

@Table({
    tableName: "user_notifications",
    timestamps: false
})
class UserNotification extends Model<
    InferAttributes<UserNotification>,
    InferCreationAttributes<UserNotification>
> {
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

    declare user?: User;
    declare notification?: Notification;
}

export default UserNotification;
