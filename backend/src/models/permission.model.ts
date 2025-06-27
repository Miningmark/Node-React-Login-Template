import { Table, Column, Model, DataType, PrimaryKey, AllowNull, AutoIncrement, Unique, BelongsToMany } from "sequelize-typescript";
import User from "@/models/user.model";
import UserPermission from "@/models/userPermission.model";
import RouteGroup from "./routeGroup.model";
import PermissionRouteGroup from "./permissionRouteGroup.model";

interface PermissionAttributes {
    id?: number;
    name: string;
    description?: string;
}

@Table({
    tableName: "permissions",
    timestamps: false
})
class Permission extends Model<Permission, PermissionAttributes> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id!: number;

    @Unique
    @AllowNull(false)
    @Column(DataType.STRING)
    name!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    description!: string;

    @BelongsToMany(() => User, () => UserPermission)
    users!: User[];

    @BelongsToMany(() => RouteGroup, () => PermissionRouteGroup)
    routeGroups!: RouteGroup[];
}

export default Permission;
