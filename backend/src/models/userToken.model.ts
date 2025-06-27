import { Table, Column, Model, DataType, PrimaryKey, AllowNull, AutoIncrement, Unique, ForeignKey, BelongsTo } from "sequelize-typescript";
import User from "@/models/user.model";

interface UserTokenAttributes {
    userId: number;
    token: string;
}

@Table({
    tableName: "users_tokens",
    timestamps: false
})
class UserToken extends Model<UserToken, UserTokenAttributes> {
    @PrimaryKey
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    userId!: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    token!: string;

    @BelongsTo(() => User)
    user!: User;
}

export default UserToken;
