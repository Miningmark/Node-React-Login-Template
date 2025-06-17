export default (sequelize, DataTypes) => {
    const Route = sequelize.define(
        "Route",
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
            method: {
                type: DataTypes.STRING,
                allowNull: false
            },
            path: {
                type: DataTypes.STRING,
                allowNull: false
            },
            description: {
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
        Route.belongsTo(models.Permission, {
            foreignKey: "permissionId",
            onDelete: "CASCADE"
        });
    };

    return Route;
};
