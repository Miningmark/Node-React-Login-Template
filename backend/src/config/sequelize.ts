import path from "path";
import { Sequelize } from "sequelize-typescript";

import { ENV } from "@/config/env";

export const sequelize = new Sequelize({
    dialect: "mariadb",
    database: ENV.DEFAULT_DATABASE_NAME,
    host: ENV.DEFAULT_DATABASE_HOST,
    port: ENV.DEFAULT_DATABASE_PORT,
    username: ENV.DEFAULT_DATABASE_USERNAME,
    password: ENV.DEFAULT_DATABASE_PASSWORD,
    pool: {
        max: 5,
        min: 0,
        acquire: 10000,
        idle: 10000
    },
    ...(ENV.CONSOLE_LOG_DATABASE_QUERRIES ? {} : { logging: false }),
    models: [path.resolve(__dirname, "../models")]
});
