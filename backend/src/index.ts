import app from "@/app";
import { ENV } from "@/config/env";
import { logger } from "@/config/logger";

const server = app.listen(ENV.BACKEND_PORT, async () => {
    logger.info(`Datenbank verbunden und Server läuft auf Port ${ENV.BACKEND_PORT} mit Version: ${ENV.BACKEND_VERSION}`);
});

const shutdown = async () => {
    logger.warn("Server Shutdown");

    app.disable("connection");

    server.close(async () => {
        try {
            //TODO: close Database
            logger.warn("Database connection successfully closed");

            process.exit(0);
        } catch (error) {
            logger.warn("Error closing Database connection", error);
            process.exit(1);
        }
    });

    setTimeout(() => {
        logger.error("Server was taking to long to shutdown");
        process.exit(1);
    }, 30000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default server;
