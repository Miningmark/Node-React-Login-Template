import BugReport from "@/models/bugReport.model.js";
import LastLogin from "@/models/lastLogin.model.js";
import Notification from "@/models/notification.model.js";
import Permission from "@/models/permission.model.js";
import ServerLog from "@/models/serverLog.model.js";
import {
    default as UserNotification,
    default as UserNotifications
} from "@/models/userNotifications.model.js";
import UserPermission from "@/models/userPermission.model.js";
import UserSettings from "@/models/userSettings.model.js";
import UserToken from "@/models/userToken.model.js";
import {
    BelongsToManyAddAssociationMixin,
    BelongsToManyAddAssociationsMixin,
    BelongsToManyCountAssociationsMixin,
    BelongsToManyCreateAssociationMixin,
    BelongsToManyGetAssociationsMixin,
    BelongsToManyHasAssociationMixin,
    BelongsToManyHasAssociationsMixin,
    BelongsToManyRemoveAssociationMixin,
    BelongsToManyRemoveAssociationsMixin,
    BelongsToManySetAssociationsMixin,
    CreationOptional,
    DataTypes,
    HasManyAddAssociationMixin,
    HasManyAddAssociationsMixin,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManyHasAssociationMixin,
    HasManyHasAssociationsMixin,
    HasManyRemoveAssociationMixin,
    HasManyRemoveAssociationsMixin,
    HasManySetAssociationsMixin,
    HasOneCreateAssociationMixin,
    HasOneGetAssociationMixin,
    HasOneSetAssociationMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute
} from "@sequelize/core";
import {
    AfterCreate,
    Attribute,
    AutoIncrement,
    BelongsToMany,
    Default,
    HasMany,
    HasOne,
    NotNull,
    PrimaryKey,
    Table,
    Unique
} from "@sequelize/core/decorators-legacy";

@Table({
    tableName: "users",
    timestamps: false
})
class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    @NotNull
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    @Unique
    @NotNull
    declare username: string;

    @Attribute(DataTypes.STRING)
    @Unique
    @NotNull
    declare email: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare password: string;

    @Attribute(DataTypes.BOOLEAN)
    @Default(false)
    @NotNull
    declare isActive: CreationOptional<boolean>;

    @Attribute(DataTypes.BOOLEAN)
    @Default(false)
    @NotNull
    declare isDisabled: CreationOptional<boolean>;

    @HasOne(() => UserSettings, {
        foreignKey: { name: "userId", onDelete: "CASCADE" },
        inverse: { as: "user" }
    })
    declare userSettings?: NonAttribute<UserSettings>;

    declare getUserSettings: HasOneGetAssociationMixin<UserSettings>;
    declare setUserSettings: HasOneSetAssociationMixin<UserSettings, number>;
    declare createUserSettings: HasOneCreateAssociationMixin<UserSettings>;

    @HasMany(() => UserToken, {
        foreignKey: { name: "userId", onDelete: "CASCADE" },
        inverse: { as: "user" }
    })
    declare userTokens?: NonAttribute<UserToken[]>;

    declare getUserTokens: HasManyGetAssociationsMixin<UserToken>;
    declare setUserTokens: HasManySetAssociationsMixin<UserToken, number>;
    declare addUserToken: HasManyAddAssociationMixin<UserToken, number>;
    declare addUserTokens: HasManyAddAssociationsMixin<UserToken, number>;
    declare removeUserToken: HasManyRemoveAssociationMixin<UserToken, number>;
    declare removeUserTokens: HasManyRemoveAssociationsMixin<UserToken, number>;
    declare createUserToken: HasManyCreateAssociationMixin<UserToken>;
    declare hasUserToken: HasManyHasAssociationMixin<UserToken, number>;
    declare hasUserTokens: HasManyHasAssociationsMixin<UserToken, number>;
    declare countUserTokens: HasManyCountAssociationsMixin<UserToken>;

    @HasMany(() => LastLogin, {
        foreignKey: { name: "userId", onDelete: "CASCADE" },
        inverse: { as: "user" }
    })
    declare lastLogins?: NonAttribute<LastLogin[]>;

    declare getLastLogins: HasManyGetAssociationsMixin<LastLogin>;
    declare setLastLogins: HasManySetAssociationsMixin<LastLogin, number>;
    declare addLastLogin: HasManyAddAssociationMixin<LastLogin, number>;
    declare addLastLogins: HasManyAddAssociationsMixin<LastLogin, number>;
    declare removeLastLogin: HasManyRemoveAssociationMixin<LastLogin, number>;
    declare removeLastLogins: HasManyRemoveAssociationsMixin<LastLogin, number>;
    declare createLastLogin: HasManyCreateAssociationMixin<LastLogin>;
    declare hasLastLogin: HasManyHasAssociationMixin<LastLogin, number>;
    declare hasLastLogins: HasManyHasAssociationsMixin<LastLogin, number>;
    declare countLastLogins: HasManyCountAssociationsMixin<LastLogin>;

    @HasMany(() => ServerLog, {
        foreignKey: { name: "userId", onDelete: "CASCADE" },
        inverse: { as: "user" }
    })
    declare serverLogs?: NonAttribute<ServerLog[]>;

    declare getServerLogs: HasManyGetAssociationsMixin<ServerLog>;
    declare setServerLogs: HasManySetAssociationsMixin<ServerLog, number>;
    declare addServerLog: HasManyAddAssociationMixin<ServerLog, number>;
    declare addServerLogs: HasManyAddAssociationsMixin<ServerLog, number>;
    declare removeServerLog: HasManyRemoveAssociationMixin<ServerLog, number>;
    declare removeServerLogs: HasManyRemoveAssociationsMixin<ServerLog, number>;
    declare createServerLog: HasManyCreateAssociationMixin<ServerLog>;
    declare hasServerLog: HasManyHasAssociationMixin<ServerLog, number>;
    declare hasServerLogs: HasManyHasAssociationsMixin<ServerLog, number>;
    declare countServerLogs: HasManyCountAssociationsMixin<ServerLog>;

    @HasMany(() => BugReport, {
        foreignKey: { name: "userId", onDelete: "CASCADE" },
        inverse: { as: "user" }
    })
    declare bugReports?: NonAttribute<BugReport[]>;

    declare getBugReports: HasManyGetAssociationsMixin<BugReport>;
    declare setBugReports: HasManySetAssociationsMixin<BugReport, number>;
    declare addUBugReport: HasManyAddAssociationMixin<BugReport, number>;
    declare addBugReports: HasManyAddAssociationsMixin<BugReport, number>;
    declare removeBugReport: HasManyRemoveAssociationMixin<BugReport, number>;
    declare removeBugReports: HasManyRemoveAssociationsMixin<BugReport, number>;
    declare createBugReport: HasManyCreateAssociationMixin<BugReport>;
    declare hasBugReport: HasManyHasAssociationMixin<BugReport, number>;
    declare hasBugReports: HasManyHasAssociationsMixin<BugReport, number>;
    declare countBugReports: HasManyCountAssociationsMixin<BugReport>;

    @BelongsToMany(() => Permission, {
        through: { model: UserPermission },
        foreignKey: "userId",
        otherKey: "permissionId",
        inverse: { as: "users" }
    })
    declare permissions?: NonAttribute<Permission[]>;

    declare getPermissions: BelongsToManyGetAssociationsMixin<Permission>;
    declare setPermissions: BelongsToManySetAssociationsMixin<Permission, number>;
    declare addPermission: BelongsToManyAddAssociationMixin<Permission, number>;
    declare addPermissions: BelongsToManyAddAssociationsMixin<Permission, number>;
    declare removePermission: BelongsToManyRemoveAssociationMixin<Permission, number>;
    declare removePermissions: BelongsToManyRemoveAssociationsMixin<Permission, number>;
    declare createPermission: BelongsToManyCreateAssociationMixin<Permission>;
    declare hasPermission: BelongsToManyHasAssociationMixin<Permission, number>;
    declare hasPermissions: BelongsToManyHasAssociationsMixin<Permission, number>;
    declare countPermissions: BelongsToManyCountAssociationsMixin<Permission>;

    @BelongsToMany(() => Notification, {
        through: { model: UserNotifications },
        foreignKey: "userId",
        otherKey: "notificationId",
        inverse: { as: "users" }
    })
    declare notifications?: NonAttribute<[Notification]>;

    declare getNotifications: BelongsToManyGetAssociationsMixin<Notification>;
    declare setNotifications: BelongsToManySetAssociationsMixin<Notification, number>;
    declare addNotification: BelongsToManyAddAssociationMixin<Notification, number>;
    declare addNotifications: BelongsToManyAddAssociationsMixin<Notification, number>;
    declare removeNotification: BelongsToManyRemoveAssociationMixin<Notification, number>;
    declare removeNotifications: BelongsToManyRemoveAssociationsMixin<Notification, number>;
    declare createNotification: BelongsToManyCreateAssociationMixin<Notification>;
    declare hasNotification: BelongsToManyHasAssociationMixin<Notification, number>;
    declare hasNotifications: BelongsToManyHasAssociationsMixin<Notification, number>;
    declare countNotifications: BelongsToManyCountAssociationsMixin<Notification>;

    @AfterCreate
    static async createSettings(user: User) {
        await UserSettings.create({ userId: user.id });
    }

    @AfterCreate
    static async assign(user: User) {
        const databaseNotifications = await Notification.findAll();

        const userNotifications = databaseNotifications.map((notification) => ({
            userId: user.id,
            notificationId: notification.id,
            confirmed: false
        }));

        UserNotification.bulkCreate(userNotifications);
    }
}

export default User;
