import { UserManagementRouteGroups } from "@/routeGroups/userManagement.routeGroup";
import { ServerToClientEvents } from "@/sockets/types.js";
import { Socket } from "socket.io";

export const registerUserSocket = (socket: Socket<ServerToClientEvents, ServerToClientEvents, any>) => {
    socket.on("user:update", () => {
        if (socket.routeGroups.includes(UserManagementRouteGroups.USER_MANAGEMENT_READ.groupName)) {
            socket.join("user:list");
        }
    });
};
