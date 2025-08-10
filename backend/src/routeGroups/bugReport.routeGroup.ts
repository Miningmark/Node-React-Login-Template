import { GroupEntry } from "@/routeGroups/index.js";

export class BugReportRouteGroups {
    static readonly BUG_REPORT_READ: GroupEntry = {
        groupName: "bugReportRead",
        groupDescription: "Hat das Recht alle Bug Reports anzusehen"
    };

    static readonly BUG_REPORT_WRITE: GroupEntry = {
        groupName: "bugReportWrite",
        groupDescription: "Hat das Recht den Status von BugReports zu ändern"
    };
}
