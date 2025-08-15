import { Socket } from "socket.io";

import {
    USER_MANAGEMENT_CREATE,
    USER_MANAGEMENT_READ,
    USER_MANAGEMENT_WRITE
} from "@/routeGroups/userManagement.routeGroup.js";
import { ClientToServerEvents, ServerToClientEvents } from "@/socketIO/types.js";

export default (socket: Socket<ClientToServerEvents, ServerToClientEvents, any>) => {
    socket.on("subscribe:userManagement:users:watchList", () => {
        if (
            socket.routeGroups.some((routeGroup) =>
                [
                    USER_MANAGEMENT_READ.groupName,
                    USER_MANAGEMENT_WRITE.groupName,
                    USER_MANAGEMENT_CREATE.groupName
                ].includes(routeGroup)
            )
        ) {
            socket.join("listen:userManagement:users:watchList");
        }
    });

    socket.on("subscribe:userManagement:permissions:watchList", () => {
        if (
            socket.routeGroups.some((routeGroup) =>
                [
                    USER_MANAGEMENT_READ.groupName,
                    USER_MANAGEMENT_WRITE.groupName,
                    USER_MANAGEMENT_CREATE.groupName
                ].includes(routeGroup)
            )
        ) {
            socket.join("listen:userManagement:permissions:watchList");
        }
    });
};
