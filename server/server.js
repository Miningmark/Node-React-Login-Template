import "dotenv/config";
import express from "express";

//middlewares
import helmet from "helmet";
import credentials from "./middleware/credentials.js";
import cors from "cors";
import corsOptions from "./config/corsOptions.js";
import cookieParser from "cookie-parser";

import verifyAccessToken from "./middleware/verifyAccessToken.js";
import authorizePermission from "./middleware/authorizePermission.js";
import { errorHandler } from "./middleware/errorHandler.js";

//sequelize and models
import { sequelize } from "./controllers/modelController.js";

//Routes
import accountRoute from "./routes/accountRoute.js";

//seeding standard users into database
import { seedDatabase } from "./seedDatabase.js";
import config from "./config/config.js";
import { NotFoundError } from "./errors/NotFoundError.js";

//init express
const app = express();

//appling middlewares
app.use(helmet());
app.use(credentials);
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/api/" + config.apiVersion, accountRoute);

//TODO: TEMP Routes for testing roles
app.get("/api/" + config.apiVersion + "/viewDashboard", verifyAccessToken, authorizePermission("view_dashboard"), (req, res, next) => {
    res.status(200).json({ message: "viewDashboard" });
});

app.get("/api/" + config.apiVersion + "/editUser", verifyAccessToken, authorizePermission("edit_user"), (req, res, next) => {
    res.status(200).json({ message: "editUser" });
});

app.get("/api/" + config.apiVersion + "/deletePost", verifyAccessToken, authorizePermission("delete_post"), (req, res, next) => {
    res.status(200).json({ message: "deletePost" });
});

app.get("/api/" + config.apiVersion + "/createPost", verifyAccessToken, authorizePermission("create_post"), (req, res, next) => {
    res.status(200).json({ message: "createPost" });
});

//catching all routes and sending an 404 error back
app.all("{*splat}", (req, res, next) => {
    next(new NotFoundError("Angeforderte Route nicht gefunden!"));
});

//global error handler for all routes
app.use(errorHandler);

//connect and sync sequelize and start server listing
(async () => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }

    sequelize.sync(config.deleteDatabaseOnStart ? { force: true } : {}).then(() => {
        app.listen(config.backendPORT, () => {
            console.log("Database connected and server is running on port " + config.backendPORT);
        });

        if (config.seedDatabase) seedDatabase();
    });
})();
