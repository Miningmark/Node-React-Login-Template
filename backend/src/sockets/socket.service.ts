import { ENV } from "@/config/env.js";
import { databaseLogger } from "@/config/logger.js";
import { ForbiddenError } from "@/errors/errorClasses.js";
import { ServerLogTypes } from "@/models/serverLog.model.js";
import UserToken, { UserTokenType } from "@/models/userToken.model.js";
import { ClientToServerEvents, ServerToClientEvents } from "@/sockets/types.js";
import { ValidationError } from "@sequelize/core";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Server } from "socket.io";
import { registerUserSocket } from "./user.socket";

export class SocketService {
    private static instance: SocketService;
    private io?: Server<ClientToServerEvents, ServerToClientEvents>;

    private constructor() {}

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public init(io: Server<ClientToServerEvents, ServerToClientEvents>) {
        this.io = io;
    }

    public async setup() {
        this.getIO().use(async (socket, next) => {
            const accessToken = socket.handshake.auth.accessToken;

            if (accessToken === undefined) {
                await databaseLogger(ServerLogTypes.WARN, "Socket abgelehnt wegen keinem AccessToken", {
                    source: "socket.io"
                });

                return next(new ValidationError("Keinen Token erhalten"));
            }

            const foundAccessToken = await UserToken.findOne({ where: { token: accessToken, type: UserTokenType.ACCESS_TOKEN } });
            if (foundAccessToken === null) {
                await databaseLogger(ServerLogTypes.WARN, "AccessToken nicht mehr gültig", {
                    source: "socket.io"
                });

                return next(new ForbiddenError("AccessToken nicht mehr gültig"));
            }

            try {
                const decodedPayload = jwt.verify(accessToken, ENV.ACCESS_TOKEN_SECRET) as JwtPayload;

                socket.userId = decodedPayload.userId;
                socket.routeGroups = decodedPayload.routeGroups;

                next();
            } catch (error) {
                await databaseLogger(ServerLogTypes.WARN, "Socket abgelehnt wegen ungültigen AccessToken", {
                    source: "socket.io"
                });
                return next(new ValidationError("AccessToken konnte nicht verifiziert werden"));
            }
        });

        this.getIO().on("connection", async (socket) => {
            await databaseLogger(ServerLogTypes.INFO, `Socket verbunden: \"${socket.id}\"`, {
                source: "socket.io"
            });

            registerUserSocket(socket);
        });

        await databaseLogger(ServerLogTypes.INFO, "SocketIO erfolgreich gestartet", {
            source: "socket.io"
        });
    }

    public getIO(): Server<ClientToServerEvents, ServerToClientEvents> {
        if (!this.io) throw new Error("SocketService not initialized");
        return this.io;
    }

    public emitToRoom(room: string, event: keyof ServerToClientEvents, data: any) {
        this.getIO().to(room).emit(event, data);
    }
}
