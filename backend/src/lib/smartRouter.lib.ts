import { verifyPermission } from "@/middlewares/verifyPermission.middleware.js";
import RouteGroup from "@/models/routeGroup.model.js";
import { GroupEntry } from "@/routeGroups/index.js";
import express, { RequestHandler, Router } from "express";

interface RouteEntry {
    method: HttpMethods;
    path: string;
    groupEntry: GroupEntry;
    middlewares: RequestHandler[];
    handler: RequestHandler;
}

enum HttpMethods {
    GET = "get",
    POST = "post"
}

class SmartRouter {
    private router: Router;
    private queueEntries: RouteEntry[];

    constructor() {
        this.router = express.Router();
        this.queueEntries = [];
    }

    private queue(method: HttpMethods, path: string, groupEntry: GroupEntry, ...handlers: RequestHandler[]) {
        const handler = handlers.pop()!;
        const middlewares = handlers;

        this.queueEntries.push({ method, path, groupEntry, middlewares, handler });
    }

    async init(): Promise<void> {
        for (const entry of this.queueEntries) {
            const { method, path, groupEntry, middlewares, handler } = entry;

            const [routeGroup, isRouteGroupCreated] = await RouteGroup.findOrCreate({
                where: { name: groupEntry.groupName },
                defaults: { name: groupEntry.groupName, description: groupEntry.groupDescription }
            });

            if (isRouteGroupCreated === false) {
                if (routeGroup.description !== groupEntry.groupDescription) {
                    routeGroup.description = groupEntry.groupDescription;
                }

                routeGroup.updatedAt = new Date(Date.now());
                await routeGroup.save();
            }

            const permissionMiddleware = verifyPermission(groupEntry.groupName);

            this.router[method](path, ...middlewares, permissionMiddleware, handler);
        }
    }

    get(path: string, groupEntry: GroupEntry, ...handlers: RequestHandler[]) {
        this.queue(HttpMethods.GET, path, groupEntry, ...handlers);
    }

    post(path: string, groupEntry: GroupEntry, ...handlers: RequestHandler[]) {
        this.queue(HttpMethods.POST, path, groupEntry, ...handlers);
    }

    async getExpressRouter() {
        await this.init();
        return this.router;
    }
}

export { SmartRouter };
