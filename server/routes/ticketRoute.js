import { SmartRouter } from "../lib/SmartRouter.js";

import * as ticketController from "../controllers/ticketController.js";
import verifyAccessToken from "../middleware/verifyAccessToken.js";

export default async () => {
    const smartRouter = new SmartRouter();

    smartRouter.get("/getTicket", "getTicket", "getTicket Description", verifyAccessToken, ticketController.getTicket);
    smartRouter.get("/getAllTickets", "getTicket", "getTicket Description", verifyAccessToken, ticketController.getAllTickets);

    smartRouter.post("/createTicket", "editTicket", "editTicket Description", verifyAccessToken, ticketController.createTicket);
    smartRouter.post("/updateTicket", "editTicket", "editTicket Description", verifyAccessToken, ticketController.updateTicket);

    smartRouter.post("/removeTicket", "removeTicket", "removeTicket Description", verifyAccessToken, ticketController.removeTicket);
    smartRouter.post("/removeTickets", "removeTicket", "removeTicket Description", verifyAccessToken, ticketController.removeTickets);

    return smartRouter.getExpressRouter();
};
