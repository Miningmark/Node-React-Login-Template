import { ControllerResponse } from "@/controllers/base.controller.js";
import BugReport, { BugReportStatusType } from "@/models/bugReport.model";
import { S3Service } from "./s3.service";

export class BugReportService {
    constructor() {}

    async createBugReport(userId: number, name: string, description: string, files: Express.Multer.File[]): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "BugReport erfolgreich erstellt" };

        const databaseBugReport = await BugReport.create({ userId: userId, name: name, description: description, status: BugReportStatusType.NEW });

        files.forEach(async (file, fileIndex) => {
            await S3Service.getInstance().uploadFile("users", `${userId}/bugReports/${databaseBugReport.id}/${fileIndex}`, file.buffer, file.mimetype);
        });

        return { type: "json", jsonResponse: jsonResponse, logResponse: false };
    }
}
