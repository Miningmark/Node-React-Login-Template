import { Socket } from "socket.io";

import { BUG_REPORT_READ, BUG_REPORT_WRITE } from "@/routeGroups/bugReport.routeGroup.js";
import { ClientToServerEvents, ServerToClientEvents } from "@/socketIO/types.js";

export default (socket: Socket<ClientToServerEvents, ServerToClientEvents, any>) => {
    socket.on("subscribe:bugReports:watchList", () => {
        if (
            socket.routeGroups.some((routeGroup) =>
                [BUG_REPORT_READ.groupName, BUG_REPORT_WRITE.groupName].includes(routeGroup)
            )
        ) {
            socket.join("listen:protected:bugReports:watchList");
        } else {
            socket.join("listen:public:bugReports:watchList");
        }
    });
};
