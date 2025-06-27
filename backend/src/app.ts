import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { ErrorMonitoringService } from "@/services/ServerErrorMonitoring.service";

import { setupSecurityMiddleware } from "@/middlewares/securityMiddleware";
import { notFoundMiddleware } from "@/middlewares/notFoundMiddleware";
import { errorHandlerMiddleware } from "@/middlewares/errorHandlerMiddleware";

import { ENV } from "@/config/env";
import { consoleLogger, databaseLogger } from "@/config/logger";
import { sequelize } from "@/config/sequelize";

import { validateRequest } from "@/middlewares/validateRequestMiddleware";
import { signupSchema } from "@/validators/auth.validator";
import { ServerLogLevels } from "./models/serverLog.model";

const app = express();

ErrorMonitoringService.getInstance();

setupSecurityMiddleware(app);
app.use(cors({ credentials: true }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.post("/", validateRequest(signupSchema), async (req: Request, res: Response) => {
    await databaseLogger(ServerLogLevels.INFO, "Home Route called", { source: "/" });
    res.status(200).json({ message: "Home Route" });
});

(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync(ENV.NODE_ENV === "development" ? { force: true } : {});

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
