import bcrypt from "bcrypt";
import { Models, sequelize } from "./controllers/modelController.js";
import { serverLogger } from "./utils/ServerLog/serverLogger.js";

export async function seedDatabase() {
    const transaction = await sequelize.transaction();
    try {
        const juli051 = await Models.User.create(
            { username: "juli051", email: "Juli051@gmx.net", password: await bcrypt.hash("Admin123!", 10) },
            { transaction: transaction }
        );
        const markus = await Models.User.create(
            { username: "markus", email: "markus.sibbe@t-online.de", password: await bcrypt.hash("Admin123!", 10) },
            { transaction: transaction }
        );

        juli051.isActive = true;
        markus.isActive = true;

        const userManagementRead = await Models.RouteGroup.findOne({ where: { name: "userManagementRead" } }, { transaction: transaction });
        const userManagementWrite = await Models.RouteGroup.findOne({ where: { name: "userManagementWrite" } }, { transaction: transaction });
        const userManagementCreate = await Models.RouteGroup.findOne({ where: { name: "userManagementCreate" } }, { transaction: transaction });

        const adminPageServerLog = await Models.RouteGroup.findOne({ where: { name: "adminPageServerLog" } }, { transaction: transaction });

        const userManagement = await Models.Permission.create(
            {
                name: "userManagement",
                description: "Es können User gesehen, bearbeitet werden"
            },
            { transaction: transaction }
        );

        const adminPage = await Models.Permission.create(
            {
                name: "adminPage",
                description: "Es kann der Serverlog gesehen und Rechte erstellt und bearbeitet werden"
            },
            { transaction: transaction }
        );

        await userManagement.addRouteGroup(userManagementRead, { transaction: transaction });
        await userManagement.addRouteGroup(userManagementWrite, { transaction: transaction });
        await userManagement.addRouteGroup(userManagementCreate, { transaction: transaction });

        await adminPage.addRouteGroup(adminPageServerLog, { transaction: transaction });

        await juli051.addPermissions([userManagement, adminPage], { transaction: transaction });
        await markus.addPermissions([userManagement, adminPage], { transaction: transaction });

        await juli051.save({ transaction: transaction });
        await markus.save({ transaction: transaction });

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        await serverLogger("CRITICAL", "Datenbank füllen hat nicht funktioniert, es wird ohne Standardwerte fortgefahren", {
            source: "seeding",
            error: error
        });
    }
}
