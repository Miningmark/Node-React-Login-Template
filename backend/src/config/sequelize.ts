import { ENV } from "@/config/env.js";
import { models } from "@/models/index.js";
import Sequelize from "@sequelize/core";
import { MariaDbDialect } from "@sequelize/mariadb";

export const sequelize = new Sequelize({
    dialect: MariaDbDialect,
    database: ENV.DEFAULT_DATABASE_NAME,
    host: ENV.DEFAULT_DATABASE_HOST,
    port: ENV.DEFAULT_DATABASE_PORT,
    user: ENV.DEFAULT_DATABASE_USERNAME,
    password: ENV.DEFAULT_DATABASE_PASSWORD,
    pool: {
        max: 5,
        min: 0,
        acquire: 10000,
        idle: 10000
    },
    ...(ENV.CONSOLE_LOG_DATABASE_QUERRIES ? { logging: console.log } : { logging: false }),
    models: models
});
