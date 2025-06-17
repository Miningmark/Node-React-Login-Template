export default (sequelize, DataTypes) => {
    const Route = sequelize.define(
        "Route",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            routeGroupId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            method: {
                type: DataTypes.STRING,
                allowNull: false
            },
            path: {
                type: DataTypes.STRING,
                allowNull: false
            }
        },
        {
            tableName: "routes",
            timestamps: false
        }
    );

    Route.associate = (models) => {
        Route.belongsTo(models.RouteGroup, {
            foreignKey: "routeGroupId",
            onDelete: "CASCADE"
        });
    };

    return Route;
};
