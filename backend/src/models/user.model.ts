import { Table, Column, Model, DataType, PrimaryKey, AllowNull, AutoIncrement, Unique, HasMany, Default, BelongsToMany } from "sequelize-typescript";
import UserToken from "@/models/userToken.model";
import UserLastLogin from "./userLastLogin.model";
import ServerLog from "./serverLog.model";
import Permission from "./permission.model";
import UserPermission from "./userPermission.model";

interface UserAttributes {
    id?: number;
    username: string;
    email: string;
    password: string;
    isActive?: boolean;
    isDisabled?: boolean;
}

@Table({
    tableName: "users",
    timestamps: false
})
class User extends Model<User, UserAttributes> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id!: number;

    @Unique
    @AllowNull(false)
    @Column(DataType.STRING)
    username!: string;

    @Unique
    @AllowNull(false)
    @Column(DataType.STRING)
    email!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    password!: string;

    @Default(false)
    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    isActive!: boolean;

    @Default(false)
    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    isDisabled!: boolean;

    @HasMany(() => UserToken, {
        onDelete: "CASCADE"
    })
    userTokens!: UserToken[];

    @HasMany(() => UserLastLogin, {
        onDelete: "CASCADE"
    })
    userLastLogins!: UserLastLogin[];

    @HasMany(() => ServerLog, {
        onDelete: "CASCADE"
    })
    serverLogs!: ServerLog[];

    @BelongsToMany(() => Permission, () => UserPermission)
    permissions!: Permission[];
}

export default User;
