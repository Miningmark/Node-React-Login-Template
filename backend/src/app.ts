import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { ErrorMonitoringService } from "@/services/ServerErrorMonitoring.service";

import { setupSecurityMiddleware } from "@/middlewares/securityMiddleware";
import { notFoundMiddleware } from "@/middlewares/notFoundMiddleware";
import { errorHandlerMiddleware } from "@/middlewares/errorHandlerMiddleware";

import { logger } from "@/config/logger";

import { sequelize } from "@/config/sequelize";
import { ENV } from "@/config/env";

import User from "@/models/user.model";
import UserToken from "@/models/userToken.model";

const app = express();

ErrorMonitoringService.getInstance();

setupSecurityMiddleware(app);
app.use(cors({ credentials: true }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    logger.info("Home Route Called");
    res.status(200).json({ message: "Home Route" });
});

(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync(ENV.NODE_ENV === "development" ? { force: true } : {});

        const user = await User.create({ username: "test", password: "test123", email: "Juli051@gmx.net" });
        const userToken = await UserToken.create({ userId: user.id, token: "testToken456789" });

        const user2 = await User.findOne({ where: { username: "test" }, include: UserToken });

        if (!(user2 instanceof User)) throw new Error("Not Found");

        console.log(user2.userTokens[0].token);

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
        console.log(error);
        process.exit(1);
    }
})();

app.use(notFoundMiddleware);

app.use(errorHandlerMiddleware);

export default app;
