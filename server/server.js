import "dotenv/config";
import express from "express";

//middlewares
import helmet from "helmet";
import credentials from "./middleware/credentials.js";
import cors from "cors";
import corsOptions from "./config/corsOptions.js";
import cookieParser from "cookie-parser";

import verifyAccessToken from "./middleware/verifyAccessToken.js";

//sequelize and models
import { sequelize } from "./controllers/modelController.js";

//public Routes
import publicAccountRoute from "./routes/account/publicAccountRoute.js";

//protected Routes
import protectedAccountRoute from "./routes/account/protectedAccountRoute.js";
import { seedDatabase } from "./seedDatabase.js";

//init express
const app = express();

//appling middlewares
app.use(helmet());
app.use(credentials);
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

//public routes
app.use("/api/" + process.env.API_VERSION, publicAccountRoute);

//middleware to protect routes
app.use(verifyAccessToken);

//protected routes
app.use("/api/" + process.env.API_VERSION, protectedAccountRoute);

//connect and sync sequelize and start server listing
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

            //TODO: remove later only for testing
            seedDatabase();
        });
})();
