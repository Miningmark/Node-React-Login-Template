export default (sequelize, DataTypes) => {
    const UserToken = sequelize.define(
        "UserToken",
        {
            userId: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            type: {
                type: DataTypes.ENUM("refreshToken", "accessToken", "userRegistration", "adminRegistration", "passwordReset", "accountReactivation"),
                allowNull: false,
                primaryKey: true
            },
            token: {
                type: DataTypes.TEXT,
                unique: true,
                allowNull: false
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            tableName: "user_token",
            timestamps: false
        }
    );

    UserToken.associate = (models) => {
        UserToken.belongsTo(models.User, {
            foreignKey: "userId",
            onDelete: "CASCADE"
        });
    };

    return UserToken;
};
