import express from "express";

import { Models } from "../controllers/modelController.js";
import verifyPermission from "../middleware/verifyPermission.js";

class SmartRouter {
    constructor() {
        this.router = express.Router();
        this.queueEntries = [];
    }

    queue(method, path, groupName, groupDescription, ...args) {
        this.queueEntries.push({ method, path, groupName, groupDescription, args });
    }

    async init() {
        for (const entry of this.queueEntries) {
            const { method, path, groupName, groupDescription, args } = entry;

            await Models.RouteGroup.findOrCreate({
                where: { name: groupName },
                defaults: { description: groupDescription }
            });

            const handler = args.pop();
            const middlewares = args;

            const permissionMiddleware = verifyPermission(groupName);

            this.router[method](path, ...middlewares, permissionMiddleware, handler);
        }
    }

    get(path, groupName, groupDescription, ...args) {
        this.queue("get", path, groupName, groupDescription, ...args);
    }

    post(path, groupName, groupDescription, ...args) {
        this.queue("post", path, groupName, groupDescription, ...args);
    }

    async getExpressRouter() {
        await this.init();
        return this.router;
    }
}

export { SmartRouter };
