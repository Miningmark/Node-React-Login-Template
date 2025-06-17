import { SmartRouter } from "../lib/SmartRouter.js";

import * as ticketController from "../controllers/ticketController.js";
import verifyAccessToken from "../middleware/verifyAccessToken.js";

export default async () => {
    const smartRouter = new SmartRouter();

    smartRouter.get("/getTicket", 'ich bin eine Beschreibung "getTicket"', verifyAccessToken, ticketController.getTicket);
    smartRouter.get("/getAllTickets", 'ich bin eine Beschreibung "getAllTickets"', verifyAccessToken, ticketController.getAllTickets);

    smartRouter.post("/createTicket", 'ich bin eine Beschreibung "createTicket"', verifyAccessToken, ticketController.createTicket);
    smartRouter.post("/updateTicket", 'ich bin eine Beschreibung "updateTicket"', verifyAccessToken, ticketController.updateTicket);

    smartRouter.post("/removeTicket", 'ich bin eine Beschreibung "removeTicket"', verifyAccessToken, ticketController.removeTicket);
    smartRouter.post("/removeTickets", 'ich bin eine Beschreibung "removeTickets"', verifyAccessToken, ticketController.removeTickets);

    return smartRouter.getExpressRouter();
};
