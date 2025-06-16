export default (sequelize, DataTypes) => {
    const UserPermission = sequelize.define(
        "UserPermission",
        {
            userId: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            permissionId: {
                type: DataTypes.INTEGER,
                primaryKey: true
            }
        },
        {
            tableName: "user-permissions",
            timestamps: false
        }
    );

    return UserPermission;
};
