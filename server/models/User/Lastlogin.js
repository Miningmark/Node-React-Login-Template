export default (sequelize, DataTypes) => {
    const LastLogin = sequelize.define(
        "LastLogin",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            userId: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            ipAdress: {
                type: DataTypes.STRING(15),
                allowNull: false
            },
            userAgent: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            country: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            region: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            loginAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        },
        {
            tableName: "last_login",
            timestamps: false
        }
    );

    LastLogin.associate = (models) => {
        LastLogin.belongsTo(models.User, {
            foreignKey: "userId",
            as: "user",
            onDelete: "CASCADE"
        });
    };

    return LastLogin;
};
