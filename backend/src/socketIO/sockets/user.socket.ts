import { ClientToServerEvents, ServerToClientEvents } from "@/socketIO/types.js";
import { Socket } from "socket.io";

export default (socket: Socket<ClientToServerEvents, ServerToClientEvents, any>) => {
    socket.join(`listen:user:${socket.userId}`);
};
