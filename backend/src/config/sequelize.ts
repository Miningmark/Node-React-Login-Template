import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import { MariaDbDialect } from "@sequelize/mariadb";
import Sequelize from "@sequelize/core";

import { ENV } from "@/config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modelsDir = path.join(__dirname, "../models");

async function loadModels() {
    const modelFiles = await fs.readdir(modelsDir);
    const models = [];

    for (const file of modelFiles) {
        if (!(file.endsWith(".model.ts") || file.endsWith(".model.js"))) continue;

        const modelPath = pathToFileURL(path.join(modelsDir, file)).href;
        const modelModule = await import(modelPath);

        if (modelModule.default) {
            models.push(modelModule.default);
        }
    }

    return models;
}

export const models = await loadModels();

export const sequelize = new Sequelize({
    dialect: MariaDbDialect,
    database: ENV.DEFAULT_DATABASE_NAME,
    host: ENV.DEFAULT_DATABASE_HOST,
    port: ENV.DEFAULT_DATABASE_PORT,
    user: ENV.DEFAULT_DATABASE_USERNAME,
    password: ENV.DEFAULT_DATABASE_PASSWORD,
    charset: "UTF8MB4",
    collation: "utf8mb4_uca1400_ai_ci",
    pool: {
        max: 5,
        min: 0,
        acquire: 10000,
        idle: 10000
    },
    // eslint-disable-next-line no-console
    ...(ENV.CONSOLE_LOG_DATABASE_QUERRIES ? { logging: console.log } : { logging: false }),
    models: models
});
