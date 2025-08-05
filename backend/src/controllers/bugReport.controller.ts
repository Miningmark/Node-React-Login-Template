import { BaseController } from "@/controllers/base.controller.js";
import { BugReportService } from "@/services/bugReport.service.js";

export class BugReportController extends BaseController {
    constructor(private bugReportService: BugReportService) {
        super();
    }
}
