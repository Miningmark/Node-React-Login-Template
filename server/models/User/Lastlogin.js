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
            ipv4Adress: {
                type: DataTypes.STRING,
                allowNull: false
            },
            userAgent: {
                type: DataTypes.STRING,
                allowNull: true
            },
            country: {
                type: DataTypes.STRING,
                allowNull: true
            },
            regionName: {
                type: DataTypes.STRING,
                allowNull: true
            },
            loginAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            successfully: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
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
            onDelete: "CASCADE"
        });
    };

    return LastLogin;
};
