import { Router } from "express";
import multer from "multer";
import { container } from "tsyringe";

import { BugReportController } from "@/controllers/bugReport.controller.js";
import { validateRequest } from "@/middlewares/validateRequest.middleware.js";
import { verifyAuth } from "@/middlewares/verifyAuth.middleware.js";
import { verifyPermission } from "@/middlewares/verifyPermission.middleware.js";
import { BUG_REPORT_READ, BUG_REPORT_WRITE } from "@/routeGroups/bugReport.routeGroup.js";
import { onlyAuthorizationSchema, onlyLimitAndOffsetSchema } from "@/validators/base.validator.js";
import {
    createBugReportSchema,
    getBugReportFileSchema,
    updateBugReportStatusSchema
} from "@/validators/bugReport.validator.js";

const router = Router();
const bugReportController = container.resolve(BugReportController);
const multerInstance = multer();

router.get(
    "/getBugReports{/:limit-:offset}",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([BUG_REPORT_READ.groupName, BUG_REPORT_WRITE.groupName]),
    validateRequest(onlyLimitAndOffsetSchema),
    bugReportController.getBugReports
);

router.get(
    "/getActiveBugReports{/:limit-:offset}",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    validateRequest(onlyLimitAndOffsetSchema),
    bugReportController.getActiveBugReports
);
router.get(
    "/getOwnBugReports{/:limit-:offset}",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    validateRequest(onlyLimitAndOffsetSchema),
    bugReportController.getOwnBugReports
);

router.post(
    "/getBugReportFile",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    validateRequest(getBugReportFileSchema),
    bugReportController.getBugReportFile
);
router.post(
    "/createBugReport",
    multerInstance.array("files"),
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    validateRequest(createBugReportSchema),
    bugReportController.createBugReport
);
router.post(
    "/updateBugReportStatus",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    validateRequest(updateBugReportStatusSchema),
    bugReportController.updateBugReportStatus
);

export default router;
