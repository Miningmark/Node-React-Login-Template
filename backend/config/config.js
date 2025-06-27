require("dotenv").config();

module.exports = {
    development: {
        username: process.env.DEFAULT_DATABASE_USERNAME,
        password: process.env.DEFAULT_DATABASE_PASSWORD,
        database: process.env.DEFAULT_DATABASE_NAME,
        host: process.env.DEFAULT_DATABASE_HOST,
        port: process.env.DEFAULT_DATABASE_PORT,
        dialect: "mariadb"
    }
};
