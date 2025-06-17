export default (sequelize, DataTypes) => {
    const User = sequelize.define(
        "User",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            username: {
                type: DataTypes.STRING(15),
                allowNull: false,
                unique: true
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            isDisabled: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        },
        {
            tableName: "users",
            timestamps: false
        }
    );

    User.associate = (models) => {
        User.hasMany(models.UserToken, {
            foreignKey: "userId",
            onDelete: "CASCADE"
        });
        User.hasMany(models.LastLogin, {
            foreignKey: "userId",
            onDelete: "CASCADE"
        });

        User.belongsToMany(models.Permission, {
            through: models.UserPermission,
            foreignKey: "userId",
            otherKey: "permissionId",
            onDelete: "CASCADE"
        });
    };

    return User;
};
