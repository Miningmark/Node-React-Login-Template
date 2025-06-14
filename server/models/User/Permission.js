export default (sequelize, DataTypes) => {
    const Permission = sequelize.define(
        "Permission",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            }
        },
        {
            tableName: "permissions",
            timestamps: false
        }
    );

    Permission.associate = (models) => {
        Permission.belongsToMany(models.Role, {
            through: models.RolePermission,
            foreignKey: "permissionId",
            otherKey: "roleId",
            onDelete: "CASCADE"
        });
    };

    return Permission;
};
