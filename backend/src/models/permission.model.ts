import PermissionRouteGroup from "@/models/permissionRouteGroup.model.js";
import RouteGroup from "@/models/routeGroup.model.js";
import User from "@/models/user.model.js";
import {
    BelongsToManyAddAssociationMixin,
    BelongsToManyAddAssociationsMixin,
    BelongsToManyCountAssociationsMixin,
    BelongsToManyCreateAssociationMixin,
    BelongsToManyGetAssociationsMixin,
    BelongsToManyHasAssociationMixin,
    BelongsToManyHasAssociationsMixin,
    BelongsToManyRemoveAssociationMixin,
    BelongsToManyRemoveAssociationsMixin,
    BelongsToManySetAssociationsMixin,
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute
} from "@sequelize/core";
import { Attribute, AutoIncrement, BelongsToMany, NotNull, PrimaryKey, Table, Unique } from "@sequelize/core/decorators-legacy";

@Table({
    tableName: "permissions",
    timestamps: false
})
class Permission extends Model<InferAttributes<Permission>, InferCreationAttributes<Permission>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    @NotNull
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    @Unique
    @NotNull
    declare name: string;

    @Attribute(DataTypes.STRING)
    declare description: string | null;

    declare users?: NonAttribute<User[]>;

    declare getUsers: BelongsToManyGetAssociationsMixin<User>;
    declare setUsers: BelongsToManySetAssociationsMixin<User, number>;
    declare addUser: BelongsToManyAddAssociationMixin<User, number>;
    declare addUsers: BelongsToManyAddAssociationsMixin<User, number>;
    declare removeUser: BelongsToManyRemoveAssociationMixin<User, number>;
    declare removeUsers: BelongsToManyRemoveAssociationsMixin<User, number>;
    declare createUser: BelongsToManyCreateAssociationMixin<User>;
    declare hasUser: BelongsToManyHasAssociationMixin<User, number>;
    declare hasUsers: BelongsToManyHasAssociationsMixin<User, number>;
    declare countUsers: BelongsToManyCountAssociationsMixin<User>;

    @BelongsToMany(() => RouteGroup, {
        through: { model: PermissionRouteGroup },
        foreignKey: "permissionId",
        otherKey: "routeGroupId",
        inverse: { as: "permissions" }
    })
    declare routeGroups?: NonAttribute<RouteGroup[]>;

    declare getRouteGroups: BelongsToManyGetAssociationsMixin<RouteGroup>;
    declare setRouteGroups: BelongsToManySetAssociationsMixin<RouteGroup, number>;
    declare addRouteGroup: BelongsToManyAddAssociationMixin<RouteGroup, number>;
    declare addURouteGroups: BelongsToManyAddAssociationsMixin<RouteGroup, number>;
    declare removeRouteGroup: BelongsToManyRemoveAssociationMixin<RouteGroup, number>;
    declare removeRouteGroups: BelongsToManyRemoveAssociationsMixin<RouteGroup, number>;
    declare createRouteGroup: BelongsToManyCreateAssociationMixin<RouteGroup>;
    declare hasRouteGroup: BelongsToManyHasAssociationMixin<RouteGroup, number>;
    declare hasRouteGroups: BelongsToManyHasAssociationsMixin<RouteGroup, number>;
    declare countRouteGroups: BelongsToManyCountAssociationsMixin<RouteGroup>;
}

export default Permission;
