import bcrypt from "bcrypt";
import { Models } from "./controllers/modelController.js";

const seedDatabase = async () => {
    const [viewDashboardPermission, editUserPermission, deletePostPermission, createPostPermission] = await Models.Permission.bulkCreate([
        { name: "view_dashboard" },
        { name: "edit_user" },
        { name: "delete_post" },
        { name: "create_post" }
    ]);

    const [adminRole, modRole, userRole] = await Models.Role.bulkCreate([{ name: "Admin" }, { name: "Moderator" }, { name: "User" }]);

    await adminRole.setPermissions([viewDashboardPermission, editUserPermission, deletePostPermission, createPostPermission]);
    await modRole.setPermissions([viewDashboardPermission, deletePostPermission, createPostPermission]);
    await userRole.setPermissions([viewDashboardPermission, createPostPermission]);

    const [juli051, markus, testAdmin, testMod, testUser] = await Promise.all([
        Models.User.create({ username: "juli051", email: "Juli051@gmx.net", password: await bcrypt.hash("Admin123!", 10) }),
        Models.User.create({ username: "markus", email: "markus.sibbe@t-online.de", password: await bcrypt.hash("Admin123!", 10) }),

        Models.User.create({ username: "testAdmin", email: "testAdmin@gmx.net", password: await bcrypt.hash("testAdmin", 10) }),
        Models.User.create({ username: "testMod", email: "testMod@gmx.net", password: await bcrypt.hash("testMod", 10) }),
        Models.User.create({ username: "testUser", email: "testUser@gmx.net", password: await bcrypt.hash("testUser", 10) })
    ]);

    await juli051.addRoles([adminRole, modRole, userRole]);
    await markus.addRoles([adminRole, modRole, userRole]);

    await testAdmin.addRoles([adminRole, modRole, userRole]);
    await testMod.addRoles([modRole, userRole]);
    await testUser.addRoles([userRole]);

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
