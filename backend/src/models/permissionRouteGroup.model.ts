import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "@sequelize/core";
import { Attribute, PrimaryKey, Table } from "@sequelize/core/decorators-legacy";

import Permission from "@/models/permission.model.js";
import RouteGroup from "@/models/routeGroup.model.js";

@Table({
    tableName: "permission_route_groups",
    timestamps: false
})
class PermissionRouteGroup extends Model<
    InferAttributes<PermissionRouteGroup>,
    InferCreationAttributes<PermissionRouteGroup>
> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    declare permissionId: number;

    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    declare routeGroupId: number;

    declare routeGroup?: RouteGroup;
    declare permission?: Permission;
}

export default PermissionRouteGroup;
