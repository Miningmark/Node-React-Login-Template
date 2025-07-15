import { AdminPageRouteGroups } from "@/routeGroups/adminPage.routeGroup.js";
import { ClientToServerEvents, ServerToClientEvents } from "@/socketIO/types.js";
import { Socket } from "socket.io";

export default (socket: Socket<ClientToServerEvents, ServerToClientEvents, any>) => {
    socket.on("subscribe:serverLogs:watchList", () => {
        if (socket.routeGroups.some((routeGroup) => [AdminPageRouteGroups.ADMIN_PANEL_PERMISSIONS_READ.groupName, AdminPageRouteGroups.ADMIN_PANEL_PERMISSIONS_WRITE.groupName].includes(routeGroup))) {
            socket.join("listen:serverLogs:watchList");
        }
    });
};
