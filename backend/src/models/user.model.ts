import { Table, Column, Model, DataType, PrimaryKey, AllowNull, AutoIncrement, Unique, HasMany } from "sequelize-typescript";
import UserToken from "@/models/userToken.model";

interface UserAttributes {
    username: string;
    email: string;
    password: string;
}

@Table({
    tableName: "users",
    timestamps: false
})
class User extends Model<User, UserAttributes> {
    @PrimaryKey
    @AutoIncrement
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

    @HasMany(() => UserToken)
    userTokens!: UserToken[];
}

export default User;
