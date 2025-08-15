import { Socket } from "socket.io";

import { ClientToServerEvents, ServerToClientEvents } from "@/socketIO/types.js";

export default (socket: Socket<ClientToServerEvents, ServerToClientEvents, any>) => {
    socket.join(`listen:user:${socket.userId}`);
};
