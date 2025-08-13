import User from "@/models/user.model.js";
import { BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "@sequelize/core";
import { Attribute, Default, NotNull, PrimaryKey, Table } from "@sequelize/core/decorators-legacy";

export enum UserSettingsTheme {
    LIGHT_THEME = "light_theme",
    DARK_THEME = "dark_theme"
}

@Table({
    tableName: "user_settings",
    timestamps: false
})
class UserSettings extends Model<InferAttributes<UserSettings>, InferCreationAttributes<UserSettings>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @NotNull
    declare userId: number;

    @Attribute(DataTypes.ENUM(...Object.values(UserSettingsTheme)))
    @Default(UserSettingsTheme.LIGHT_THEME)
    @NotNull
    declare theme: CreationOptional<UserSettingsTheme>;

    @Attribute(DataTypes.BOOLEAN)
    @Default(false)
    @NotNull
    declare isSideMenuFixed: CreationOptional<boolean>;

    @Attribute(DataTypes.JSON)
    @Default([])
    @NotNull
    declare menuBookmarks: CreationOptional<
        {
            linkName: string;
            link: string;
        }[]
    >;

    declare user?: NonAttribute<User>;

    declare getUser: BelongsToGetAssociationMixin<User>;
    declare setUser: BelongsToSetAssociationMixin<User, number>;
}

export default UserSettings;
