import { SmartRouter } from "../lib/SmartRouter.js";

import * as userManagementController from "../controllers/userManagementController.js";
import verifyAccessToken from "../middleware/verifyAccessToken.js";

export default async () => {
    const smartRouter = new SmartRouter();

    smartRouter.get("/getUsers{/:limit-:offset}", "userManagementRead", "Hat das Recht alle Userdaten zu sehen", verifyAccessToken, userManagementController.getUsers);

    return smartRouter.getExpressRouter();
};
