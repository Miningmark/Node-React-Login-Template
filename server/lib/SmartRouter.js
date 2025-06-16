import express from "express";

import { Models } from "../controllers/modelController.js";

class SmartRouter {
    constructor() {
        this.router = express.Router();
        this.routes = [];
    }

    async register(method, path, handler, description = "", middlewares = []) {
        await Models.Route.findOrCreate({
            where: { method, path },
            defaults: { description }
        });

        //const middleware = createPermissionMiddleware(method, path, this.models);
        this.router[method](path, middlewares, /*middleware,*/ handler);
        this.routes.push({ method, path, description });
    }

    get(path, handler, description, middlewares = []) {
        this.register("get", path, handler, description, middlewares);
    }

    post(path, handler, description = "", middlewares = []) {
        this.register("post", path, handler, description, middlewares);
    }

    getExpressRouter() {
        return this.router;
    }
}

export { SmartRouter };
