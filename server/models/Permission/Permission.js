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
                type: DataTypes.STRING
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
    };

    return Permission;
};
