import "dotenv/config";
import isDevMode from "../utils/env.js";

export const database = {
    database: process.env.DATABASE_DATABASE,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 10000,
        idle: 10000
    },
    ...(isDevMode() ? {} : { logging: false })
};
