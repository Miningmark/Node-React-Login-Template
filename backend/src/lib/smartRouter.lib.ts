import { verifyPermission } from "@/middlewares/verifyPermission.middleware.js";
import RouteGroup from "@/models/routeGroup.model.js";
import express, { RequestHandler, Router } from "express";

enum HttpMethods {
    GET = "get",
    POST = "post"
}

interface RouteEntry {
    method: HttpMethods;
    path: string;
    groupName: string;
    groupDescription: string;
    middlewares: RequestHandler[];
    handler: RequestHandler;
}

class SmartRouter {
    private router: Router;
    private queueEntries: RouteEntry[];

    constructor() {
        this.router = express.Router();
        this.queueEntries = [];
    }

    private queue(method: HttpMethods, path: string, groupName: string, groupDescription: string, ...handlers: RequestHandler[]) {
        const handler = handlers.pop()!;
        const middlewares = handlers;

        this.queueEntries.push({ method, path, groupName, groupDescription, middlewares, handler });
    }

    async init(): Promise<void> {
        for (const entry of this.queueEntries) {
            const { method, path, groupName, groupDescription, middlewares, handler } = entry;

            const [routeGroup, isRouteGroupCreated] = await RouteGroup.findOrCreate({
                where: { name: groupName },
                defaults: { name: groupName, description: groupDescription }
            });

            if (!isRouteGroupCreated) {
                if (routeGroup.description !== groupDescription) {
                    routeGroup.description = groupDescription;
                }
                routeGroup.updatedAt = new Date(Date.now());
                routeGroup.save();
            }

            const permissionMiddleware = verifyPermission(groupName);

            this.router[method](path, ...middlewares, permissionMiddleware, handler);
        }
    }

    get(path: string, groupName: string, groupDescription: string, ...handlers: RequestHandler[]) {
        this.queue(HttpMethods.GET, path, groupName, groupDescription, ...handlers);
    }

    post(path: string, groupName: string, groupDescription: string, ...handlers: RequestHandler[]) {
        this.queue(HttpMethods.POST, path, groupName, groupDescription, ...handlers);
    }

    async getExpressRouter() {
        await this.init();
        return this.router;
    }
}

export { SmartRouter };
