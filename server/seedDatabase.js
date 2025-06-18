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

    const readTickets = await Models.Permission.create({
        name: "readTickets",
        description: "Es können sämtliche Tickets angesehen werden"
    });
    const createAndEditAndRemoveTickets = await Models.Permission.create({
        name: "editAndRemoveTickets",
        description: "Es können neue Tickets erstellt und bearbeitet und entfernt werden"
    });

    const getTicketRouteGroup = await Models.RouteGroup.findOne({ where: { name: "getTicket" } });
    const editTicketRouteGroup = await Models.RouteGroup.findOne({ where: { name: "editTicket" } });
    const removeTicketRouteGroup = await Models.RouteGroup.findOne({ where: { name: "removeTicket" } });

    await readTickets.addRouteGroup(getTicketRouteGroup);

    await createAndEditAndRemoveTickets.addRouteGroup(editTicketRouteGroup);
    await createAndEditAndRemoveTickets.addRouteGroup(removeTicketRouteGroup);

    const userManagementRead = await Models.RouteGroup.findOne({ where: { name: "userManagementRead" } });

    const userManagement = await Models.Permission.create({
        name: "userManagement",
        description: "Es können User gesehen, bearbeitet und gelöscht werden"
    });

    userManagement.addRouteGroup(userManagementRead);

    await juli051.addPermissions([readTickets, createAndEditAndRemoveTickets, userManagement]);
    await markus.addPermissions([readTickets, createAndEditAndRemoveTickets, userManagement]);
    await testAdmin.addPermissions([readTickets, createAndEditAndRemoveTickets]);

    await testMod.addPermissions([readTickets]);

    await testUser.addPermissions([readTickets]);

    await juli051.save();
    await markus.save();

    await testAdmin.save();
    await testMod.save();
    await testUser.save();
};

export { seedDatabase };
