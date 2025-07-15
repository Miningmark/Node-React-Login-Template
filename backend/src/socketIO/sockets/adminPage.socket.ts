import { UserManagementRouteGroups } from "@/routeGroups/userManagement.routeGroup.js";
import { ClientToServerEvents, ServerToClientEvents } from "@/socketIO/types.js";
import { Socket } from "socket.io";

export default (socket: Socket<ClientToServerEvents, ServerToClientEvents, any>) => {
    socket.on("subscribe:serverLogs:watchList", () => {
        if (socket.routeGroups.includes(UserManagementRouteGroups.USER_MANAGEMENT_READ.groupName)) {
            socket.join("listen:serverLogs:watchList");
        }
    });
};
