import { UserManagementRouteGroups } from "@/routeGroups/userManagement.routeGroup.js";
import { ClientToServerEvents, ServerToClientEvents } from "@/sockets/types.js";
import { Socket } from "socket.io";

export const registerUserManagementSocket = (socket: Socket<ClientToServerEvents, ServerToClientEvents, any>) => {
    socket.on("subscribe:users:watchList", () => {
        if (socket.routeGroups.includes(UserManagementRouteGroups.USER_MANAGEMENT_READ.groupName)) {
            socket.join("listen:users:watchList");
        }
    });
};
