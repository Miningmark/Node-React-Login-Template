import "dotenv/config";
import express from "express";
import bcrypt from "bcrypt";

//middlewares
import helmet from "helmet";
import credentials from "./middleware/credentials.js";
import cors from "cors";
import corsOptions from "./config/corsOptions.js";
import cookieParser from "cookie-parser";

//sequelize and models
import { sequelize, Models } from "./controllers/modelController.js";

//routes
import accountRoute from "./routes/account/accountRoute.js";

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
app.use("/api/" + process.env.API_VERSION, accountRoute);

//middleware to protect routes

//protected routes
//TODO:

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
            (async () => {
                const [adminRole, userRole, modRole] = await Promise.all([
                    Models.Role.create({ name: "Admin" }),
                    Models.Role.create({ name: "User" }),
                    Models.Role.create({ name: "Moderator" })
                ]);

                const [juli051, markus] = await Promise.all([
                    Models.User.create({ username: "juli051", email: "Juli051@gmx.net", password: await bcrypt.hash("Admin123!", 10) }),
                    Models.User.create({ username: "markus", email: "markus.sibbe@t-online.de", password: await bcrypt.hash("Admin123!", 10) })
                ]);

                await juli051.addRoles([adminRole, modRole, userRole]);
                await markus.addRoles([adminRole, modRole, userRole]);

                juli051.isActive = true;
                markus.isActive = true;

                await juli051.save();
                await markus.save();
            })();
        });
})();
