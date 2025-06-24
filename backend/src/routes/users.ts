import { Router } from "express";
import { createUser, getUserById, getUsers } from "../handlers/users";

const router = Router();

router.get("/", getUsers);

router.get("/:id", getUserById);

router.post("/", createUser);
/*import config from "../../config/config.js";
import * as accountController from "../../controllers/Account/accountController.js";
import verifyAccessToken from "../../middleware/verifyAccessToken.js";*/

/*router.get("/refreshAccessToken", accountController.refreshAccessToken);
router.get("/getRouteGroups", verifyAccessToken, accountController.getRouteGroups);
router.get("/getUsername", verifyAccessToken, accountController.getUsername);
router.get("/getLastLogins", verifyAccessToken, accountController.getLastLogins);

if (config.isRegisterEnable) {
    router.post("/changeUsername", verifyAccessToken, accountController.changeUsername);
    router.post("/register", accountController.register);
    router.post("/accountActivation", accountController.accountActivation);
}

router.post("/login", accountController.login);
router.post("/logout", verifyAccessToken, accountController.logout);
router.post("/changePassword", verifyAccessToken, accountController.changePassword);
router.post("/changeEmail", verifyAccessToken, accountController.changeEmail);
router.post("/requestPasswordReset", accountController.requestPasswordReset);
router.post("/passwordResetOrReactivation", accountController.passwordResetOrReactivation);*/

export default router;
