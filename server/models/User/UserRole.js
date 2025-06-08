export default (sequelize, DataTypes) => {
    const UserRole = sequelize.define(
        "UserRole",
        {
            userId: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            roleId: {
                type: DataTypes.INTEGER,
                primaryKey: true
            }
        },
        {
            tableName: "user_roles",
            timestamps: false
        }
    );

    return UserRole;
};
