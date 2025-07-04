import { sequelize } from "@/config/sequelize";
import User from "@/models/user.model";
import bcrypt from "bcrypt";

beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    const user = await User.create({ username: "TestUser", password: await bcrypt.hash("TestUser", 10), email: "testuser@testuser.com" });
    user.isActive = true;
    await user.save();
});

afterAll(async () => {
    await sequelize.close();
});
