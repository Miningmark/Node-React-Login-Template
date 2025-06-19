import config from "./config/config.js";
import express from "express";

import helmet from "helmet";
import credentials from "./middleware/credentials.js";
import cors from "cors";
import corsOptions from "./config/corsOptions.js";
import cookieParser from "cookie-parser";

import { sequelize } from "./controllers/modelController.js";
import { seedDatabase } from "./seedDatabase.js";

import { errorHandler } from "./middleware/errorHandler.js";
import { NotFoundError } from "./errors/NotFoundError.js";
import { serverLogger } from "./utils/ServerLog/serverLogger.js";

import accountRoute from "./routes/Account/accountRoute.js";
import userManagementRoute from "./routes/UserManagement/userManagementRoute.js";

const app = express();

app.use(helmet());
app.use(credentials);
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync(config.deleteDatabaseOnStart ? { force: true } : {});

        app.use("/api/" + config.apiVersion + "/user", accountRoute);

        app.use("/api/" + config.apiVersion + "/userManagement", await userManagementRoute());

        if (config.seedDatabase) await seedDatabase();

        app.all("{*splat}", (req, res, next) => {
            next(new NotFoundError("Angeforderte Route nicht gefunden!"));
        });

        app.use(errorHandler);

        app.listen(config.backendPORT, async () => {
            await serverLogger("INFO", "Datenbank verbunden und Server läuft auf Port " + config.backendPORT + " mit Version: " + config.serverVersion, {
                source: "startup"
            });
        });
    } catch (error) {
        await serverLogger("CRITICAL", error.message, {
            source: "startup",
            error: error
        });
        process.exit(1);
    }
})();
