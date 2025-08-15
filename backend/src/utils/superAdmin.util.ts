import bcrypt from "bcrypt";

import { ENV } from "@/config/env.js";
import { databaseLogger } from "@/config/logger.js";
import Permission from "@/models/permission.model.js";
import RouteGroup from "@/models/routeGroup.model.js";
import { ServerLogTypes } from "@/models/serverLog.model.js";
import User from "@/models/user.model.js";

export async function generateSuperAdmin() {
    try {
        const hashedPassword = await bcrypt.hash(ENV.SUPER_ADMIN_PASSWORD, 10);
        let databaseUser = await User.findOne({ where: { username: "SuperAdmin" } });
        let databasePermission = await Permission.findOne({
            where: { name: "SuperAdmin Berechtigung" }
        });

        if (databaseUser === null) {
            databaseUser = await User.create({
                username: "SuperAdmin",
                email: "",
                password: hashedPassword,
                isActive: true
            });
        } else {
            const isEqual = await bcrypt.compare(ENV.SUPER_ADMIN_PASSWORD, databaseUser.password);
            if (!isEqual) {
                databaseUser.password = hashedPassword;
                await databaseUser.save();
            }
        }

        if (databasePermission === null) {
            databasePermission = await Permission.create({
                name: "SuperAdmin Berechtigung",
                description: "Hat sämtlich Berechtigungen für den SuperAdmin"
            });
        }

        const databaseRouteGroups = await RouteGroup.findAll();

        await databaseUser.setPermissions([databasePermission]);
        await databasePermission.setRouteGroups(databaseRouteGroups);

        await databaseLogger(
            ServerLogTypes.INFO,
            "SuperAdmin und Berechtigungen erfolgreich erstellt/geupdated",
            { source: "superAdmin.utils" }
        );
    } catch (error) {
        await databaseLogger(ServerLogTypes.ERROR, error instanceof Error ? error.message : "", {
            error: error instanceof Error ? error : undefined
        });
    }
}

//TODO: remove
export async function generateDevUser() {
    const hashedPassword = await bcrypt.hash("Test123!", 10);
    let databaseUser = await User.findOne({ where: { username: "devUser" } });

    if (databaseUser === null) {
        databaseUser = await User.create({
            username: "devUser",
            email: "devUser@devUser.com",
            password: hashedPassword,
            isActive: true
        });
    }

    let databasePermission = await Permission.findOne({ where: { name: "DevUser Berechtigung" } });

    if (databaseUser === null) return;

    if (databasePermission === null) {
        databasePermission = await Permission.create({
            name: "DevUser Berechtigung",
            description: "Hat sämtlich Berechtigungen für den DevUser"
        });
    }

    const databaseRouteGroups = await RouteGroup.findAll();

    await databaseUser.setPermissions([databasePermission]);
    await databasePermission.setRouteGroups(databaseRouteGroups);
}
