import app from "@/app";
import { ENV } from "@/config/env";
import { consoleLogger, databaseLogger } from "@/config/logger";
import { sequelize } from "@/config/sequelize";
import { Server } from "http";
import { ServerLogLevels } from "./models/serverLog.model";

const server = app.listen(ENV.BACKEND_PORT, async () => {
    setTimeout(async () => {
        await databaseLogger(ServerLogLevels.INFO, `Datenbank verbunden und Server läuft auf Port ${ENV.BACKEND_PORT} mit Version: ${ENV.BACKEND_VERSION}`, {
            source: "startup"
        });
    }, 2000);
});

const shutdown = async () => {
    await databaseLogger(ServerLogLevels.WARN, "Server fährt runter", { source: "shutdown" });

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
