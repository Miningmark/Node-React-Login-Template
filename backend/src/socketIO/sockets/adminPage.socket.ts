import {
    ADMIN_PAGE_MAINTENANCE_MODE_WRITE,
    ADMIN_PAGE_NOTIFICATIONS_READ,
    ADMIN_PAGE_NOTIFICATIONS_WRITE,
    ADMIN_PAGE_PERMISSIONS_READ,
    ADMIN_PAGE_PERMISSIONS_WRITE,
    ADMIN_PAGE_SERVER_LOG_READ
} from "@/routeGroups/adminPage.routeGroup.js";
import { ClientToServerEvents, ServerToClientEvents } from "@/socketIO/types.js";
import { Socket } from "socket.io";

export default (socket: Socket<ClientToServerEvents, ServerToClientEvents, any>) => {
    socket.on("subscribe:adminPage:serverLogs:watchList", () => {
        if (socket.routeGroups.some((routeGroup) => [ADMIN_PAGE_SERVER_LOG_READ.groupName].includes(routeGroup))) {
            socket.join("listen:adminPage:serverLogs:watchList");
        }
    });

    socket.on("subscribe:adminPage:permissions:watchList", () => {
        if (socket.routeGroups.some((routeGroup) => [ADMIN_PAGE_PERMISSIONS_READ.groupName, ADMIN_PAGE_PERMISSIONS_WRITE.groupName].includes(routeGroup))) {
            socket.join("listen:adminPage:permissions:watchList");
        }
    });

    socket.on("subscribe:adminPage:notifications:watchList", () => {
        if (socket.routeGroups.some((routeGroup) => [ADMIN_PAGE_NOTIFICATIONS_READ.groupName, ADMIN_PAGE_NOTIFICATIONS_WRITE.groupName].includes(routeGroup))) {
            socket.join("listen:adminPage:notifications:watchList");
        }
    });

    socket.on("subscribe:adminPage:maintenanceMode:watchList", () => {
        if (socket.routeGroups.some((routeGroup) => [ADMIN_PAGE_MAINTENANCE_MODE_WRITE.groupName].includes(routeGroup))) {
            socket.join("listen:adminPage:maintenanceMode:watchList");
        }
    });
};
