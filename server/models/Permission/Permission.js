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
                allowNull: false
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true
            }
        },
        {
            tableName: "permissions",
            timestamps: false
        }
    );

    Permission.associate = (models) => {
        Permission.hasMany(models.Route, {
            foreignKey: "permissionId",
            onDelete: "CASCADE"
        });

        Permission.belongsToMany(models.User, {
            through: models.UserPermission,
            foreignKey: "permissionId",
            otherKey: "userId",
            onDelete: "CASCADE"
        });
    };

    return Permission;
};
