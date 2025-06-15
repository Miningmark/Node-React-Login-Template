import config from "./config.js";

export const defaultDatabase = {
    database: config.defaultDatabaseName,
    username: config.defaultDatabaseUsername,
    password: config.defaultDatabasePassword,
    host: config.defaultDatabaseHost,
    port: config.defaultDatabasePort,
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 10000,
        idle: 10000
    },
    ...(config.logDatabaseQuerries ? {} : { logging: false })
};
