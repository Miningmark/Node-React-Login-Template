import { ENV } from "@/config/env.js";
import { databaseLogger } from "@/config/logger.js";
import { ForbiddenError } from "@/errors/errorClasses.js";
import { ServerLogTypes } from "@/models/serverLog.model.js";
import UserToken, { UserTokenType } from "@/models/userToken.model.js";
import { ClientToServerEvents, ServerToClientEvents } from "@/socketIO/types.js";
import { ValidationError } from "@sequelize/core";
import fs from "fs/promises";
import jwt, { JwtPayload } from "jsonwebtoken";
import path from "path";
import { Server, Socket } from "socket.io";
import { singleton } from "tsyringe";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const socketDir = path.join(__dirname, "..", "socketIO", "sockets");

@singleton()
export class SocketService {
    private io?: Server<ClientToServerEvents, ServerToClientEvents>;

    constructor() {}

    public init(io: Server<ClientToServerEvents, ServerToClientEvents>) {
        this.io = io;
    }

    public async setup() {
        this.getIO().use(async (socket, next) => {
            const accessToken = socket.handshake.auth.accessToken;

            if (accessToken === undefined) {
                await databaseLogger(
                    ServerLogTypes.WARN,
                    "Socket abgelehnt wegen keinem AccessToken",
                    {
                        source: "socket.io"
                    }
                );

                return next(new ValidationError("Keinen Token erhalten"));
            }

            const foundAccessToken = await UserToken.findOne({
                where: { token: accessToken, type: UserTokenType.ACCESS_TOKEN }
            });
            if (foundAccessToken === null) {
                await databaseLogger(ServerLogTypes.WARN, "AccessToken nicht mehr gültig", {
                    source: "socket.io"
                });

                return next(new ForbiddenError("AccessToken nicht mehr gültig"));
            }

            try {
                const decodedPayload = jwt.verify(
                    accessToken,
                    ENV.ACCESS_TOKEN_SECRET
                ) as JwtPayload;

                socket.userId = decodedPayload.userId;
                socket.routeGroups = decodedPayload.routeGroups;

                next();
            } catch (error) {
                await databaseLogger(
                    ServerLogTypes.WARN,
                    "Socket abgelehnt wegen ungültigen AccessToken",
                    {
                        source: "socket.io"
                    }
                );
                return next(new ValidationError("AccessToken konnte nicht verifiziert werden"));
            }
        });

        this.getIO().on("connection", async (socket) => {
            await databaseLogger(
                ServerLogTypes.INFO,
                `Socket verbunden: \"${socket.id}\" für Benutzer ID: \"${socket.userId}\"`,
                {
                    userId: socket.userId,
                    source: "socket.io"
                }
            );

            socket.on("disconnecting", async (reason) => {
                await databaseLogger(
                    ServerLogTypes.INFO,
                    `Socket getrennt \"${socket.id}\ mit der Begründung: \"${reason}\" für Benutzer ID: \"${socket.userId}\"`,
                    {
                        userId: socket.userId,
                        source: "socket.io"
                    }
                );
            });

            await this.loadSockets(socket);
        });

        await databaseLogger(ServerLogTypes.INFO, "SocketIO erfolgreich gestartet", {
            source: "socket.io"
        });
    }

    private async loadSockets(socket: Socket<ClientToServerEvents, ServerToClientEvents, any>) {
        const files = await fs.readdir(socketDir);

        for (const file of files) {
            if (!(file.endsWith(".socket.ts") || file.endsWith(".socket.js"))) continue;

            const fullPath = path.join(socketDir, file);
            const moduleUrl = pathToFileURL(fullPath).toString();

            (await import(moduleUrl)).default(socket);
        }
    }

    public getIO(): Server<ClientToServerEvents, ServerToClientEvents> {
        if (!this.io) throw new Error("SocketService not initialized");
        return this.io;
    }

    public emitToRoom(room: string, event: keyof ServerToClientEvents, data: any) {
        this.getIO().to(room).emit(event, data);
    }
}
