import app from "@/app";
import { ENV } from "@/config/env";
import { consoleLogger, databaseLogger } from "@/config/logger";
import { sequelize } from "@/config/sequelize";
import { Server } from "http";
import { ServerLogLevels } from "./models/serverLog.model";

const server = app.listen(ENV.BACKEND_PORT, async () => {
    setTimeout(async () => {
        await databaseLogger(ServerLogLevels.INFO, `Database connected and server is running on port ${ENV.BACKEND_PORT} with version: ${ENV.BACKEND_VERSION}`, {
            source: "startup"
        });
    }, 2000);
});

const shutdown = async () => {
    await databaseLogger(ServerLogLevels.WARN, "Server Shutdown", { source: "shutdown" });

    app.disable("connection");

    server.close(async () => {
        try {
            await sequelize.close();
            consoleLogger.warn("Database connection successfully closed");

            process.exit(0);
        } catch (error) {
            consoleLogger.warn("Error closing Database connection", error);
            process.exit(1);
        }
    });

    setTimeout(() => {
        consoleLogger.error("Server was taking too long to shutdown");
        process.exit(1);
    }, 30000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default server;
