import { BugReportController } from "@/controllers/bugReport.controller.js";
import { SmartRouter } from "@/lib/smartRouter.lib.js";
import { validateRequest } from "@/middlewares/validateRequest.middleware.js";
import { verifyAuth } from "@/middlewares/verifyAuth.middleware.js";
import { BugReportRouteGroups } from "@/routeGroups/bugReport.routeGroup.js";
import { BugReportService } from "@/services/bugReport.service.js";
import { createBugReportSchema, getBugReportFileSchema, getBugReportsSchema, getOwnBugReportsSchema } from "@/validators/bugReport.validator.js";
import multer from "multer";

export default async () => {
    const smartRouter = new SmartRouter();
    const router = await smartRouter.getExpressRouter();

    const multerInstance = multer();

    const bugReportService = new BugReportService();
    const bugReportController = new BugReportController(bugReportService);

    smartRouter.get("/getBugReports{/:limit-:offset}", BugReportRouteGroups.BUG_REPORT_READ, verifyAuth(), validateRequest(getBugReportsSchema), bugReportController.getBugReports);

    router.get("/getOwnBugReports{/:limit-:offset}", verifyAuth(), validateRequest(getOwnBugReportsSchema), bugReportController.getOwnBugReports);
    router.get("/getBugReportFile", verifyAuth(), validateRequest(getBugReportFileSchema), bugReportController.getBugReportFile); //TODO: Permission

    router.post("/createBugReport", multerInstance.array("files"), verifyAuth(), validateRequest(createBugReportSchema), bugReportController.createBugReport);

    return smartRouter.getExpressRouter();
};
