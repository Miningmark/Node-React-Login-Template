import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import z from "zod/v4";

import { ErrorMonitoringService } from "@/services/ServerErrorMonitoring.service";

import { setupSecurityMiddleware } from "@/middlewares/security.middleware";
import { notFoundMiddleware } from "@/middlewares/notFound.middleware";
import { errorHandlerMiddleware } from "@/middlewares/errorHandler.middleware";

import { ENV } from "@/config/env";
import { consoleLogger } from "@/config/logger";
import { sequelize } from "@/config/sequelize";

import { generateSuperAdmin, generateSuperAdminPermission } from "@/utils/superAdmin.util";

import authRoutes from "@/routes/auth.routes";

const app = express();

ErrorMonitoringService.getInstance();

z.config(z.locales.de());

setupSecurityMiddleware(app);
app.use(cors({ credentials: true }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/" + ENV.API_VERSION + "/user", authRoutes);

(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync(ENV.NODE_ENV === "development" ? { force: true } : {});

        await generateSuperAdmin();
        await generateSuperAdminPermission();

        //const user = new User({ username: "Juli051", email: "Juli051@gmx.net", password: "123456" });
        //await user.save();

        /*app.use("/api/" + config.apiVersion + "/user", accountRoute);

        app.use("/api/" + config.apiVersion + "/userManagement", await userManagementRoute());
        app.use("/api/" + config.apiVersion + "/adminPage", await adminPageRoute());

        await removeRouteGroups();
        await generateSuperAdmin();

        if (config.seedDatabase) await seedDatabase();

        app.all("{*splat}", (req, res, next) => {
            next(new NotFoundError("Angeforderte Route nicht gefunden!"));
        });

        app.use(errorHandler);

        app.listen(ENV.BACKEND_PORT, async () => {
            console.log(`Datenbank verbunden und Server läuft auf Port ${ENV.BACKEND_PORT} mit Version: ${ENV.BACKEND_VERSION}`);
            await serverLogger("INFO", "Datenbank verbunden und Server läuft auf Port " + config.backendPort + " mit Version: " + config.serverVersion, {
                source: "startup"
            });
        });*/
    } catch (error) {
        consoleLogger.error(error instanceof Error ? error.message : "", { error: error instanceof Error ? error.stack : "" });
        process.exit(1);
    }
})();

app.use(notFoundMiddleware);

app.use(errorHandlerMiddleware);

export default app;
