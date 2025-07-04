import { sequelize } from "@/config/sequelize";
import { afterAll, beforeAll } from "vitest";

beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.close();
});
