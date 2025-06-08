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
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            }
        },
        {
            tableName: "users",
            timestamps: false
        }
    );

    User.associate = (models) => {
        User.belongsToMany(models.Role, {
            through: models.UserRole,
            foreignKey: "userId",
            otherKey: "roleId"
        });
    };

    return User;
};
