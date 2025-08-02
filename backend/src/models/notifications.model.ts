import User from "@/models/user.model.js";
import UserNotification from "@/models/userNotifications.model.js";
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
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute
} from "@sequelize/core";
import { AfterCreate, Attribute, AutoIncrement, NotNull, PrimaryKey, Table } from "@sequelize/core/decorators-legacy";

@Table({
    tableName: "notifications",
    timestamps: false
})
class Notification extends Model<InferAttributes<Notification>, InferCreationAttributes<Notification>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    @NotNull
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING(25))
    @NotNull
    declare name: string;

    @Attribute(DataTypes.STRING(16000))
    @NotNull
    declare description: string;

    @Attribute(DataTypes.DATE)
    @NotNull
    declare notifyFrom: Date;

    @Attribute(DataTypes.DATE)
    @NotNull
    declare notifyTo: Date;

    declare users?: NonAttribute<User[]>;

    declare getUsers: BelongsToManyGetAssociationsMixin<User>;
    declare setUsers: BelongsToManySetAssociationsMixin<User, number>;
    declare addUser: BelongsToManyAddAssociationMixin<User, number>;
    declare addUsers: BelongsToManyAddAssociationsMixin<User, number>;
    declare removeUser: BelongsToManyRemoveAssociationMixin<User, number>;
    declare removeUsers: BelongsToManyRemoveAssociationsMixin<User, number>;
    declare createUser: BelongsToManyCreateAssociationMixin<User>;
    declare hasUser: BelongsToManyHasAssociationMixin<User, number>;
    declare hasUsers: BelongsToManyHasAssociationsMixin<User, number>;
    declare countUsers: BelongsToManyCountAssociationsMixin<User>;

    @AfterCreate
    static async createUserNotifications(notification: Notification) {
        const databaseUsers = await User.findAll();

        const userNotifications = databaseUsers.map((user) => ({
            userId: user.id,
            notificationId: notification.id,
            confirmed: false
        }));

        await UserNotification.bulkCreate(userNotifications);
    }
}

export default Notification;
