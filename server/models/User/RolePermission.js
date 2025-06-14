export default (sequelize, DataTypes) => {
    const RolePermission = sequelize.define(
        "RolePermission",
        {
            roleId: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            permissionId: {
                type: DataTypes.INTEGER,
                primaryKey: true
            }
        },
        {
            tableName: "role-permission",
            timestamps: false
        }
    );

    return RolePermission;
};
