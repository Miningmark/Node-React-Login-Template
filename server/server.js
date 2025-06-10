import "dotenv/config";
import express from "express";

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

                const [markus, juli, christian] = await Promise.all([
                    Models.User.create({ username: "markus", email: "markus@example.com", password: "5178989489" }),
                    Models.User.create({ username: "juli", email: "juli@example.com", password: "548948949" }),
                    Models.User.create({ username: "christian", email: "christian@example.com", password: "561978489489" })
                ]);

                await markus.addRoles([adminRole, modRole, userRole]);
                await juli.addRole([modRole, userRole]);
                await christian.addRoles([userRole]);

                markus.isActive = true;
                await markus.save();

                //TODO:

                //console.log(generateUUID());

                /*for (let i = 0; i < 200; i++) {
                    let uuidTest = uuidv4().replaceAll("-", "");
                    console.log(uuidTest);
                    console.log(uuidTest.length);
                }*/

                //sendMail("Juli051@gmx.net", "Test123456", "Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam laborum, facilis sint ad minus odit blanditiis amet! Obcaecati, hic quos, pariatur totam, ipsa ducimus voluptatibus et doloribus dolorum amet aliquid!"));
            })();
        });
})();
