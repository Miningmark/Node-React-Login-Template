import express from "express";
import { ErrorMonitoringService } from "@/services/errorMonitoring.service";
//import { ENV } from "./config/env";

/*import helmet from "helmet";
//import credentials from "./middleware/credentials.js";
import cors from "cors";
//import corsOptions from "./config/corsOptions.js";
import cookieParser from "cookie-parser";*/

const app = express();

ErrorMonitoringService.getInstance();

/*app.use(helmet());
//app.use(credentials);
app.use(cors(/*corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/users", usersRouter);*/

/*(async () => {
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


        app.listen(ENV.BACKEND_PORT, async () => {
            console.log(`Datenbank verbunden und Server läuft auf Port ${ENV.BACKEND_PORT} mit Version: ${ENV.BACKEND_VERSION}`);
            /*await serverLogger("INFO", "Datenbank verbunden und Server läuft auf Port " + config.backendPort + " mit Version: " + config.serverVersion, {
                source: "startup"
            });
        });
    } catch (error) {
        /*await serverLogger("CRITICAL", error.message, {
            source: "startup",
            error: error
        });
        process.exit(1);
    }
})();*/

export default app;
