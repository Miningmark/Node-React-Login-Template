export default (sequelize, DataTypes) => {
    const ServerLog = sequelize.define(
        "ServerLog",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            level: {
                type: DataTypes.ENUM("INFO", "ERROR", "CRITICAL"),
                allowNull: false
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            url: {
                type: DataTypes.STRING,
                allowNull: true
            },
            method: {
                type: DataTypes.STRING,
                allowNull: true
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            ipv4Adress: {
                type: DataTypes.STRING,
                allowNull: true
            },
            userAgent: {
                type: DataTypes.STRING,
                allowNull: true
            },
            requestBody: {
                type: DataTypes.JSON, //JSON
                allowNull: true
            },
            requestHeaders: {
                type: DataTypes.JSON, //JSON
                allowNull: true
            },
            response: {
                type: DataTypes.JSON, //JSON
                allowNull: true
            },
            source: {
                type: DataTypes.STRING,
                allowNull: true
            },
            errorStack: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            timestamp: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            tableName: "server-log",
            timestamps: false
        }
    );

    ServerLog.associate = (models) => {
        ServerLog.belongsTo(models.User, {
            foreignKey: "userId",
            onDelete: "CASCADE"
        });
    };

    return ServerLog;
};
