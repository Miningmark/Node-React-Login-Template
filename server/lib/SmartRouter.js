import express from "express";

import { Models } from "../controllers/modelController.js";
import verifyPermission from "../middleware/verifyPermission.js";

class SmartRouter {
    constructor() {
        this.router = express.Router();
        this.routes = [];
    }

    async register(method, path, description, ...args) {
        await Models.Route.findOrCreate({
            where: { method: method, path: path },
            defaults: { description: description }
        });

        const handler = args.pop();
        const middlewares = args;

        const permissionMiddleware = verifyPermission(method, path);

        this.router[method](path, ...middlewares, permissionMiddleware, handler);
        this.routes.push({ method, path, description });
    }

    get(path, description, ...args) {
        this.register("get", path, description, ...args);
    }

    post(path, description, ...args) {
        this.register("post", path, description, ...args);
    }

    getExpressRouter() {
        return this.router;
    }
}

export { SmartRouter };
