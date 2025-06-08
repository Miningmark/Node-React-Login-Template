export default (sequelize, DataTypes) => {
    const UserToken = sequelize.define(
        "UserToken",
        {
            userId: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            token: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            },
            type: {
                type: DataTypes.ENUM("registration", "passwordReset"),
                allowNull: false
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false
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
