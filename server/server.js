import "dotenv/config";
import express from "express";

import cors from "cors";
import helmet from "helmet";

import { sequelize } from "./controllers/modelController.js";

import loginRoute from "./routes/login/loginRoute.js";

//Init Expressw
const app = express();

//Middleware
app.use(cors({ credentials: true, origin: true }));
app.use(helmet());

//Routes
app.use("/api/" + process.env.API_VERSION, loginRoute);

(async () => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }

    sequelize
        .sync({
            force: true
        })
        .then(() => {
            app.listen(process.env.SERVER_PORT, () => {
                console.log("Database connected and server is running on port " + process.env.SERVER_PORT);
            });
        });
})();
