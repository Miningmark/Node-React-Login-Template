import { ENV } from "@/config/env.js";
import { InternalServerError } from "@/errors/errorClasses.js";
import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model
} from "@sequelize/core";
import {
    AfterSync,
    Attribute,
    AutoIncrement,
    NotNull,
    PrimaryKey,
    Table,
    Unique
} from "@sequelize/core/decorators-legacy";

export enum ServerSettingKey {
    MAINTENANCE_MODE = "maintenance_mode",
    ENABLE_REGISTER = "enable_register",
    ENABLE_USERNAME_CHANGE = "enable_username_change"
}

@Table({
    tableName: "server_settings",
    timestamps: false
})
class ServerSettings extends Model<
    InferAttributes<ServerSettings>,
    InferCreationAttributes<ServerSettings>
> {
    @Attribute(DataTypes.INTEGER)
    @AutoIncrement
    @PrimaryKey
    @NotNull
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.ENUM(...Object.values(ServerSettingKey)))
    @Unique
    @NotNull
    declare key: ServerSettingKey;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare value: boolean;

    @AfterSync
    static async ensureGenerateDefaults() {
        for (const key of Object.values(ServerSettingKey)) {
            const databaseServerSetting = await ServerSettings.findOne({
                where: { key: key }
            });

            if (databaseServerSetting === null) {
                await ServerSettings.create({
                    key: key,
                    value: false
                });
            }
        }
    }

    @AfterSync
    static async checkForENVChanges() {
        const databaseServerSettingRegister = await ServerSettings.findOne({
            where: { key: "enable_register" }
        });

        if (databaseServerSettingRegister === null)
            throw new InternalServerError("Fehler bei den Server Settings");

        if (databaseServerSettingRegister.value !== ENV.ENABLE_REGISTER) {
            databaseServerSettingRegister.value = ENV.ENABLE_REGISTER;
            await databaseServerSettingRegister.save();
        }

        const databaseServerSettingUsername = await ServerSettings.findOne({
            where: { key: "enable_username_change" }
        });

        if (databaseServerSettingUsername === null)
            throw new InternalServerError("Fehler bei den Server Settings");

        if (databaseServerSettingUsername.value !== ENV.ENABLE_USERNAME_CHANGE) {
            databaseServerSettingUsername.value = ENV.ENABLE_USERNAME_CHANGE;
            await databaseServerSettingUsername.save();
        }
    }
}

export default ServerSettings;
