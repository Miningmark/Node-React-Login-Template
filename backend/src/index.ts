import "reflect-metadata";
import http from "http";

import { container } from "tsyringe";
import { Server } from "socket.io";

import app, { initApp } from "@/app.js";
import { ENV } from "@/config/env.js";
import { consoleLogger, databaseLogger } from "@/config/logger.js";
import { sequelize } from "@/config/sequelize.js";
import { scheduleAllCronJobs } from "@/croner/scheduler.js";
import { ServerLogTypes } from "@/models/serverLog.model.js";
import { RouteGroupService } from "@/services/routeGroup.service.js";
import { SocketService } from "@/services/socket.service.js";
import { generateDevUser, generateSuperAdmin } from "@/utils/superAdmin.util.js";

const httpServer = http.createServer(app);

const socketService = container.resolve(SocketService);
const io = new Server(httpServer, {
    cors: {
        origin: ENV.CORS_ALLOWED_ORIGINS,
        methods: ["GET", "POST"],
        credentials: true
    }
});

const init = async () => {
    try {
        socketService.init(io);

        await sequelize.authenticate();
        await sequelize.sync(ENV.NODE_ENV === "development" ? { force: true } : {});

        await databaseLogger(
            ServerLogTypes.INFO,
            `Datenbank verbunden und Server läuft auf Port ${ENV.BACKEND_PORT} mit Version: ${ENV.BACKEND_VERSION}`,
            {
                source: "startup"
            }
        );

        await initApp();

        await RouteGroupService.createRouteGroups();
        await RouteGroupService.removeUnusedRouteGroups();

        await generateSuperAdmin();
        await generateDevUser();

        await scheduleAllCronJobs();

        httpServer.listen(ENV.BACKEND_PORT);

        await socketService.setup();
    } catch (error) {
        consoleLogger.error(error instanceof Error ? error.message : "", {
            error: error instanceof Error ? error.stack : ""
        });
        process.exit(1);
    }
};

const shutdown = async () => {
    await databaseLogger(ServerLogTypes.WARN, "Server fährt runter", { source: "shutdown" });

    container
        .resolve(SocketService)
        .getIO()
        .sockets.sockets.forEach((socket) => {
            socket.disconnect(true);
        });

    httpServer.close(async () => {
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

await init();
