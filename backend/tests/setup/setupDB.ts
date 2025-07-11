import { initApp } from "@/app";
import { ENV } from "@/config/env.js";
import { models } from "@/models/index.js";
import Sequelize from "@sequelize/core";
import { SqliteDialect } from "@sequelize/sqlite3";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";

const sequelize = new Sequelize({
    dialect: SqliteDialect,
    storage: ":memory:",
    pool: {
        max: 1,
        idle: Infinity,
        maxUses: Infinity
    },

    models: models
});

beforeAll(async () => {
    await sequelize.authenticate();
});

beforeEach(async () => {
    await sequelize.sync({ force: true });
    await initApp();
});

afterAll(async () => {
    await sequelize.close();
});
