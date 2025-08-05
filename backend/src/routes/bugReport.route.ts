import { BugReportController } from "@/controllers/bugReport.controller.js";
import { SmartRouter } from "@/lib/smartRouter.lib.js";
import { validateRequest } from "@/middlewares/validateRequest.middleware";
import { verifyAuth } from "@/middlewares/verifyAuth.middleware";
import { BugReportService } from "@/services/bugReport.service.js";
import { createBugReportSchema } from "@/validators/bugReport.validator";
import multer from "multer";

export default async () => {
    const smartRouter = new SmartRouter();
    const router = await smartRouter.getExpressRouter();

    const multerInstance = multer();

    const bugReportService = new BugReportService();
    const bugReportController = new BugReportController(bugReportService);

    router.post("/createBugReport", multerInstance.array("files"), verifyAuth(), validateRequest(createBugReportSchema), bugReportController.createBugReport);

    return smartRouter.getExpressRouter();
};
