import Permission from "@/models/permission.model.js";
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
import { Attribute, AutoIncrement, Default, NotNull, PrimaryKey, Table, Unique } from "@sequelize/core/decorators-legacy";

@Table({
    tableName: "route_groups",
    timestamps: false
})
class RouteGroup extends Model<InferAttributes<RouteGroup>, InferCreationAttributes<RouteGroup>> {
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
    declare description: string;

    @Attribute(DataTypes.DATE)
    @Default(DataTypes.NOW)
    @NotNull
    declare updatedAt: CreationOptional<Date>;

    declare permissions?: NonAttribute<Permission[]>;

    declare getPermissions: BelongsToManyGetAssociationsMixin<Permission>;
    declare setPermissions: BelongsToManySetAssociationsMixin<Permission, number>;
    declare addPermission: BelongsToManyAddAssociationMixin<Permission, number>;
    declare addPermissions: BelongsToManyAddAssociationsMixin<Permission, number>;
    declare removePermission: BelongsToManyRemoveAssociationMixin<Permission, number>;
    declare removePermissions: BelongsToManyRemoveAssociationsMixin<Permission, number>;
    declare createPermission: BelongsToManyCreateAssociationMixin<Permission>;
    declare hasPermission: BelongsToManyHasAssociationMixin<Permission, number>;
    declare hasPermissions: BelongsToManyHasAssociationsMixin<Permission, number>;
    declare countPermissions: BelongsToManyCountAssociationsMixin<Permission>;
}

export default RouteGroup;
