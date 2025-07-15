import { UserManagementRouteGroups } from "@/routeGroups/userManagement.routeGroup.js";
import { ClientToServerEvents, ServerToClientEvents } from "@/socketIO/types.js";
import { Socket } from "socket.io";

export default (socket: Socket<ClientToServerEvents, ServerToClientEvents, any>) => {
    socket.on("subscribe:userManagement:users:watchList", () => {
        if (
            socket.routeGroups.some((routeGroup) =>
                [UserManagementRouteGroups.USER_MANAGEMENT_READ.groupName, UserManagementRouteGroups.USER_MANAGEMENT_WRITE.groupName, UserManagementRouteGroups.USER_MANAGEMENT_CREATE.groupName].includes(routeGroup)
            )
        ) {
            socket.join("listen:userManagement:users:watchList");
        }
    });

    socket.on("subscribe:userManagement:permissions:watchList", () => {
        if (
            socket.routeGroups.some((routeGroup) =>
                [UserManagementRouteGroups.USER_MANAGEMENT_READ.groupName, UserManagementRouteGroups.USER_MANAGEMENT_WRITE.groupName, UserManagementRouteGroups.USER_MANAGEMENT_CREATE.groupName].includes(routeGroup)
            )
        ) {
            socket.join("listen:userManagement:permissions:watchList");
        }
    });
};
