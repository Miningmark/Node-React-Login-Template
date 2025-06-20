export default (sequelize, DataTypes) => {
    const RouteGroup = sequelize.define(
        "RouteGroup",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            permissionId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        },
        {
            tableName: "route-groups",
            timestamps: false
        }
    );

    RouteGroup.associate = (models) => {
        RouteGroup.belongsTo(models.Permission, {
            foreignKey: "permissionId"
        });
    };
    return RouteGroup;
};
