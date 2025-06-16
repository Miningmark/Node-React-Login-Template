import { SmartRouter } from "../lib/SmartRouter.js";

import * as newPermissionController from "../controllers/newPermissionController.js";
import verifyAccessToken from "../middleware/verifyAccessToken.js";

export default async () => {
    const smartRouter = new SmartRouter();

    smartRouter.get("/test1", newPermissionController.test1, "Hallo ich bin eine Beschreibung");
    smartRouter.get("/test2", newPermissionController.test2, "Ich bin eine Beschreibung für eine Route die Juli angelegt hat", [verifyAccessToken]);

    return smartRouter.getExpressRouter();
};
