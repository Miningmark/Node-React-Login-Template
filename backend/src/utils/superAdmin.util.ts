import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { ENV } from "@/config/env";
import User from "@/models/user.model";
import Permission from "@/models/permission.model";
import { databaseLogger } from "@/config/logger";
import { ServerLogLevels } from "@/models/serverLog.model";
import { ValidationError } from "@/errors/validationError";
import RouteGroup from "@/models/routeGroup.model";
import UserToken, { UserTokenType } from "@/models/userToken.model";

export async function generateSuperAdmin() {
    try {
        const hashedPassword = await bcrypt.hash(ENV.SUPER_ADMIN_PASSWORD, 10);
        let databaseUser = await User.findOne({ where: { username: "SuperAdmin" } });

        if (databaseUser === null) {
            databaseUser = await User.create({ username: "SuperAdmin", email: "", password: hashedPassword, isActive: true });
        } else {
            const isEqual = await bcrypt.compare(ENV.SUPER_ADMIN_PASSWORD, databaseUser.password);
            if (!isEqual) {
                databaseUser.password = hashedPassword;
                await databaseUser.save();
            }
        }
        await databaseLogger(ServerLogLevels.INFO, "SuperAdmin erfolgreich erstellt/geupdated", { source: "superAdmin.utils" });
    } catch (error) {
        await databaseLogger(ServerLogLevels.ERROR, error instanceof Error ? error.message : "", { error: error instanceof Error ? error : undefined });
    }
}

export async function generateSuperAdminPermission() {
    try {
        const databaseUser = await User.findOne({ where: { username: "SuperAdmin" } });
        let databasePermission = await Permission.findOne({ where: { name: "SuperAdmin" } });

        if (databaseUser === null) throw new ValidationError("SuperAdmin existiert nicht");

        if (databasePermission === null) {
            databasePermission = await Permission.create({ name: "SuperAdmin Berechtigung", description: "Hat sämtlich Berechtigungen für den SuperAdmin" });
        }

        const databaseRouteGroups = await RouteGroup.findAll();

        await databaseUser.$set("permissions", databasePermission);
        await databasePermission.$set("routeGroups", databaseRouteGroups);

        await databaseLogger(ServerLogLevels.INFO, "SuperAdmin Berechtigung erfolgreich erstellt/geupdated", { source: "superAdmin.utils" });
    } catch (error) {
        await databaseLogger(ServerLogLevels.ERROR, error instanceof Error ? error.message : "", { error: error instanceof Error ? error : undefined });
    }
}

export async function removeRouteGroups() {
    /*const transaction = await sequelize.transaction();
    try {
        let dateNow = new Date(Date.now());
        const routeGroups = await Models.RouteGroup.findAll({ transaction: transaction });

        if (routeGroups !== null) {
            await Promise.all(
                routeGroups.map(async (routeGroup) => {
                    if (Math.abs(dateNow - new Date(routeGroup.updatedAt)) > 2 * 1000) {
                        await routeGroup.destroy({ transaction: transaction });
                    }
                })
            );
        }

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        await serverLogger("CRITICAL", "Löschen der nicht mehr benutzen RouteGroups fehlgeschlagen", {
            source: "routeGroupRemoval",
            error: error
        });
    }*/
}
