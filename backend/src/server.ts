import config from "./config/config.js";
import express from "express";

import helmet from "helmet";
//import credentials from "./middleware/credentials.js";
import cors from "cors";
//import corsOptions from "./config/corsOptions.js";
import cookieParser from "cookie-parser";

//import { sequelize } from "./controllers/modelController.js";
//import { seedDatabase } from "./seedDatabase.js";
//import { generateSuperAdmin, removeRouteGroups } from "./utils/utils.js";

//import { errorHandler } from "./middleware/errorHandler.js";
//import { NotFoundError } from "./errors/NotFoundError.js";
//import { serverLogger } from "./utils/ServerLog/serverLogger.js";

//import accountRoute from "./routes/Account/accountRoute.js";

//import userManagementRoute from "./routes/UserManagement/userManagementRoute.js";
//import adminPageRoute from "./routes/AdminPage/adminPageRoute.js";

const app = express();

app.use(helmet());
//app.use(credentials);
app.use(cors(/*corsOptions*/));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

(async () => {
    try {
        /*await sequelize.authenticate();
        await sequelize.sync(config.deleteDatabaseOnStart ? { force: true } : {});

        app.use("/api/" + config.apiVersion + "/user", accountRoute);

        app.use("/api/" + config.apiVersion + "/userManagement", await userManagementRoute());
        app.use("/api/" + config.apiVersion + "/adminPage", await adminPageRoute());

        await removeRouteGroups();
        await generateSuperAdmin();

        if (config.seedDatabase) await seedDatabase();

        app.all("{*splat}", (req, res, next) => {
            next(new NotFoundError("Angeforderte Route nicht gefunden!"));
        });

        app.use(errorHandler);
*/


    console.log(config.allowedOrigins);
        app.listen(config.backendPort, async () => {
            console.log("Datenbank verbunden und Server läuft auf Port " + config.backendPort + " mit Version: " + config.serverVersion);
            /*await serverLogger("INFO", "Datenbank verbunden und Server läuft auf Port " + config.backendPort + " mit Version: " + config.serverVersion, {
                source: "startup"
            });*/
        });
    } catch (error) {
        /*await serverLogger("CRITICAL", error.message, {
            source: "startup",
            error: error
        });*/
        process.exit(1);
    }
})();
