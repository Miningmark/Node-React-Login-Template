import bcrypt from "bcrypt";
import { Models } from "./controllers/modelController.js";

const seedDatabase = async () => {
    const [juli051, markus, testAdmin, testMod, testUser] = await Promise.all([
        Models.User.create({ username: "juli051", email: "Juli051@gmx.net", password: await bcrypt.hash("Admin123!", 10) }),
        Models.User.create({ username: "markus", email: "markus.sibbe@t-online.de", password: await bcrypt.hash("Admin123!", 10) }),

        Models.User.create({ username: "testAdmin", email: "testAdmin@gmx.net", password: await bcrypt.hash("testAdmin", 10) }),
        Models.User.create({ username: "testMod", email: "testMod@gmx.net", password: await bcrypt.hash("testMod", 10) }),
        Models.User.create({ username: "testUser", email: "testUser@gmx.net", password: await bcrypt.hash("testUser", 10) })
    ]);

    juli051.isActive = true;
    markus.isActive = true;

    testAdmin.isActive = true;
    testMod.isActive = true;
    testUser.isActive = true;

    await juli051.save();
    await markus.save();

    await testAdmin.save();
    await testMod.save();
    await testUser.save();
};

export { seedDatabase };
