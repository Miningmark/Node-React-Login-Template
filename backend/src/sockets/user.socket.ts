import { UserManagementRouteGroups } from "@/routeGroups/userManagement.routeGroup";
import { ClientToServerEvents, ServerToClientEvents } from "@/sockets/types.js";
import { Socket } from "socket.io";

export const registerUserSocket = (socket: Socket<ClientToServerEvents, ServerToClientEvents, any>) => {
    socket.on("user:watchList", () => {
        if (socket.routeGroups.includes(UserManagementRouteGroups.USER_MANAGEMENT_READ.groupName)) {
            socket.join("user:list");
        }
    });
};
