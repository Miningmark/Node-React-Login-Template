import { SmartRouter } from "../../lib/SmartRouter.js";

import * as adminPageController from "../../controllers/AdminPage/adminPageController.js";
import verifyAccessToken from "../../middleware/verifyAccessToken.js";

export default async () => {
    const smartRouter = new SmartRouter();

    smartRouter.get("/getServerLog{/:limit-:offset}", "adminPageServerLog", "Hat das Recht den Serverlog zu sehen", verifyAccessToken, adminPageController.getServerLog);
    smartRouter.get("/getFilteredServerLog{/:limit-:offset}", "adminPageServerLog", "Hat das Recht den Serverlog zu sehen", verifyAccessToken, adminPageController.getFilteredServerLog);

    return smartRouter.getExpressRouter();
};
