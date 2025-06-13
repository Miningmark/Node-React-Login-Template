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

//sequelize and models
import { sequelize } from "./controllers/modelController.js";

//public Routes
import publicAccountRoute from "./routes/publicAccountRoute.js";

//protected Routes
import protectedAccountRoute from "./routes/protectedAccountRoute.js";

//seeding standard users into database
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

app.get("/api/" + process.env.API_VERSION + "/viewDashboard", authorizePermission("view_dashboard"), (req, res, next) => {
    res.status(200).json({ message: "viewDashboard" });
});

app.get("/api/" + process.env.API_VERSION + "/editUser", authorizePermission("edit_user"), (req, res, next) => {
    res.status(200).json({ message: "editUser" });
});

app.get("/api/" + process.env.API_VERSION + "/deletePost", authorizePermission("delete_post"), (req, res, next) => {
    res.status(200).json({ message: "deletePost" });
});

app.get("/api/" + process.env.API_VERSION + "/createPost", authorizePermission("create_post"), (req, res, next) => {
    res.status(200).json({ message: "createPost" });
});

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
