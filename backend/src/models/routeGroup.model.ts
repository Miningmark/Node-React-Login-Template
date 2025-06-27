import { Table, Column, Model, DataType, PrimaryKey, AllowNull, AutoIncrement, Unique, BelongsToMany, Default } from "sequelize-typescript";
import Permission from "@/models/permission.model";
import PermissionRouteGroup from "@/models/permissionRouteGroup.model";

interface RouteGroupAttributes {
    id?: number;
    name: string;
    description?: string;
    createdAt?: Date;
}

@Table({
    tableName: "route_groups",
    timestamps: false
})
class RouteGroup extends Model<RouteGroup, RouteGroupAttributes> {
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

    @AllowNull(false)
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;

    @BelongsToMany(() => Permission, () => PermissionRouteGroup)
    permissions!: Permission[];
}

export default RouteGroup;
