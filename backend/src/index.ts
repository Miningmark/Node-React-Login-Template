import app, { initApp } from "@/app.js";
import { ENV } from "@/config/env.js";
import { consoleLogger, databaseLogger } from "@/config/logger.js";
import { sequelize } from "@/config/sequelize.js";
import { scheduleAllCronJobs } from "@/croner/scheduler.js";
import { ServerLogTypes } from "@/models/serverLog.model.js";
import { RouteGroupService } from "@/services/routeGroup.service.js";
import { generateSuperAdmin, generateSuperAdminPermission } from "@/utils/superAdmin.util.js";

const server = app.listen(ENV.BACKEND_PORT, async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync(ENV.NODE_ENV === "development" ? { force: true } : {});

        await databaseLogger(ServerLogTypes.INFO, `Datenbank verbunden und Server läuft auf Port ${ENV.BACKEND_PORT} mit Version: ${ENV.BACKEND_VERSION}`, {
            source: "startup"
        });

        await initApp();

        await RouteGroupService.removeUnusedRouteGroups();

        await generateSuperAdmin();
        await generateSuperAdminPermission();

        await scheduleAllCronJobs();
    } catch (error) {
        consoleLogger.error(error instanceof Error ? error.message : "", { error: error instanceof Error ? error.stack : "" });
        process.exit(1);
    }
});

const shutdown = async () => {
    await databaseLogger(ServerLogTypes.WARN, "Server fährt runter", { source: "shutdown" });

    app.disable("connection");

    server.close(async () => {
        try {
            await sequelize.close();
            consoleLogger.warn("Datenbank Verbindung erfolgreich geschlossen");

            process.exit(0);
        } catch (error) {
            consoleLogger.warn("Fehler beim Datenbank schließen", error);
            process.exit(1);
        }
    });

    setTimeout(() => {
        consoleLogger.error("Server hat zulange gebraucht um runterfahren");
        process.exit(1);
    }, 30000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default server;
