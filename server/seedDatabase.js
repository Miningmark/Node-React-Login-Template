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
        description: "Es können sämtliche Tickets angesehen"
    }); //Routes: getTicket, getAllTickets
    const createAndModifyTickets = await Models.Permission.create({
        name: "createAndModifyTickets",
        description: "Es können neue Tickets erstellt und bearbeitet werden"
    }); //Routes: createTicket, updateTicket
    const removeTickets = await Models.Permission.create({
        name: "removeTickets",
        description: "Es können Tickets gelöscht werden"
    }); //Routes: removeTicket, removeTickets

    const getTicketRoute = await Models.Route.findOne({ where: { method: "get", path: "/getTicket" } });
    const getAllTicketsRoute = await Models.Route.findOne({ where: { method: "get", path: "/getAllTickets" } });
    const createTicketRoute = await Models.Route.findOne({ where: { method: "post", path: "/createTicket" } });
    const updateTicketRoute = await Models.Route.findOne({ where: { method: "post", path: "/updateTicket" } });
    const removeTicketRoute = await Models.Route.findOne({ where: { method: "post", path: "/removeTicket" } });
    const removeTicketsRoute = await Models.Route.findOne({ where: { method: "post", path: "/removeTickets" } });

    await getTicketRoute.setPermission(readTickets);
    await getAllTicketsRoute.setPermission(readTickets);

    await createTicketRoute.setPermission(createAndModifyTickets);
    await updateTicketRoute.setPermission(createAndModifyTickets);

    await removeTicketRoute.setPermission(removeTickets);
    await removeTicketsRoute.setPermission(removeTickets);

    juli051.addPermissions([readTickets, createAndModifyTickets, removeTickets]);
    markus.addPermissions([readTickets, createAndModifyTickets, removeTickets]);
    testAdmin.addPermissions([readTickets, createAndModifyTickets, removeTickets]);

    testMod.addPermissions([readTickets, createAndModifyTickets]);

    testUser.addPermissions([readTickets]);

    await juli051.save();
    await markus.save();

    await testAdmin.save();
    await testMod.save();
    await testUser.save();
};

export { seedDatabase };
