import "dotenv/config";
import express from "express";

import cors from "cors";
import helmet from "helmet";

import { sequelize, Models } from "./controllers/modelController.js";

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
                await juli.addRole(modRole, userRole);
                await christian.addRoles([userRole]);

                const users = await Models.User.findAll({ include: Models.Role });
                users.forEach((user) => {
                    console.log(`\n${user.username} hat Rollen:`);
                    user.Roles.forEach((role) => console.log(` - ${role.name}`));
                });

                await sequelize.close();
            })();
        });
})();
