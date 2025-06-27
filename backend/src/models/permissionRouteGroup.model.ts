import { Table, Column, Model, DataType, PrimaryKey, AllowNull, AutoIncrement, Unique, BelongsToMany, Default, ForeignKey } from "sequelize-typescript";
import User from "@/models/user.model";
import UserPermission from "@/models/userPermission.model";
import Permission from "@/models/permission.model";
import RouteGroup from "./routeGroup.model";

interface PermissionRouteGroupAttributes {
    routeGroupId?: number;
    permissionId?: number;
}

@Table({
    tableName: "permission_route_groups",
    timestamps: false
})
class PermissionRouteGroup extends Model<PermissionRouteGroup, PermissionRouteGroupAttributes> {
    @PrimaryKey
    @ForeignKey(() => RouteGroup)
    @AllowNull(false)
    @Column({ type: DataType.INTEGER, onDelete: "CASCADE" })
    routeGroupId!: number;

    @PrimaryKey
    @ForeignKey(() => Permission)
    @AllowNull(false)
    @Column({ type: DataType.INTEGER, onDelete: "CASCADE" })
    permissionId!: number;
}

export default PermissionRouteGroup;
