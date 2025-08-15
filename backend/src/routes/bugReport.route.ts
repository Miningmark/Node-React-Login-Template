import { Router } from "express";
import multer from "multer";
import { container } from "tsyringe";

import { BugReportController } from "@/controllers/bugReport.controller.js";
import { validateRequest } from "@/middlewares/validateRequest.middleware.js";
import { verifyAuth } from "@/middlewares/verifyAuth.middleware.js";
import { verifyPermission } from "@/middlewares/verifyPermission.middleware.js";
import { BUG_REPORT_READ, BUG_REPORT_WRITE } from "@/routeGroups/bugReport.routeGroup.js";
import { BugReportService } from "@/services/bugReport.service.js";
import {
    createBugReportSchema,
    getActiveBugReportsSchema,
    getBugReportFileSchema,
    getBugReportsSchema,
    getOwnBugReportsSchema,
    updateBugReportStatusSchema
} from "@/validators/bugReport.validator.js";

const router = Router();
const bugReportController = container.resolve(BugReportController);
const multerInstance = multer();

router.get(
    "/getBugReports{/:limit-:offset}",
    verifyAuth(),
    verifyPermission([BUG_REPORT_READ.groupName, BUG_REPORT_WRITE.groupName]),
    validateRequest(getBugReportsSchema),
    bugReportController.getBugReports
);

router.get(
    "/getActiveBugReports{/:limit-:offset}",
    verifyAuth(),
    validateRequest(getActiveBugReportsSchema),
    bugReportController.getActiveBugReports
);
router.get(
    "/getOwnBugReports{/:limit-:offset}",
    verifyAuth(),
    validateRequest(getOwnBugReportsSchema),
    bugReportController.getOwnBugReports
);

router.post(
    "/getBugReportFile",
    verifyAuth(),
    validateRequest(getBugReportFileSchema),
    bugReportController.getBugReportFile
);
router.post(
    "/createBugReport",
    multerInstance.array("files"),
    verifyAuth(),
    validateRequest(createBugReportSchema),
    bugReportController.createBugReport
);
router.post(
    "/updateBugReportStatus",
    verifyAuth(),
    validateRequest(updateBugReportStatusSchema),
    bugReportController.updateBugReportStatus
);

export default router;
