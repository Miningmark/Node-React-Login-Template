import Notification from "@/models/notification.model.js";
import User from "@/models/user.model.js";
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "@sequelize/core";
import { Attribute, Default, NotNull, PrimaryKey, Table } from "@sequelize/core/decorators-legacy";
import Permission from "@/models/permission.model";

@Table({
    tableName: "user_permissions",
    timestamps: false
})
class UserPermission extends Model<InferAttributes<UserPermission>, InferCreationAttributes<UserPermission>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    declare permissionId: number;

    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    declare userId: number;

    declare user?: User;
    declare permission?: Permission;
}

export default UserPermission;
