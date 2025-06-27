import { Table, Column, Model, DataType, PrimaryKey, AllowNull, ForeignKey } from "sequelize-typescript";
import User from "@/models/user.model";
import Permission from "@/models/permission.model";

interface UserPermissionAttributes {
    userId?: number;
    permissionId?: number;
}

@Table({
    tableName: "user_permissions",
    timestamps: false
})
class UserPermission extends Model<UserPermission, UserPermissionAttributes> {
    @PrimaryKey
    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({ type: DataType.INTEGER, onDelete: "CASCADE" })
    userId!: number;

    @PrimaryKey
    @ForeignKey(() => Permission)
    @AllowNull(false)
    @Column({ type: DataType.INTEGER, onDelete: "CASCADE" })
    permissionId!: number;
}

export default UserPermission;
