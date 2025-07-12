import { UserManagementRouteGroups } from "@/routeGroups/userManagement.routeGroup.js";
import { ClientToServerEvents, ServerToClientEvents } from "@/sockets/types.js";
import { Socket } from "socket.io";

export const registerUserSocket = (socket: Socket<ClientToServerEvents, ServerToClientEvents, any>) => {
    socket.on("subscribe:users:watchList", () => {
        console.log("SOCKET SUBSCRIBE" + socket.id);
        if (socket.routeGroups.includes(UserManagementRouteGroups.USER_MANAGEMENT_READ.groupName)) {
            console.log("SOCKET LISTEN" + socket.id);
            socket.join("listen:users:watchList");
        }
    });

    /*socket.on("user:watchList", () => {
        if (socket.routeGroups.includes(UserManagementRouteGroups.USER_MANAGEMENT_READ.groupName)) {
            socket.join("user:list");
        }
    });*/

    /*socket.on("user:watchList", () => {
        if (socket.routeGroups.includes(UserManagementRouteGroups.USER_MANAGEMENT_READ.groupName)) {
            socket.join("user:list");
        }
    });*/
};
