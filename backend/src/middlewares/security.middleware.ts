import cors from "cors";
import { Express } from "express";
import helmet from "helmet";

import { ENV } from "@/config/env.js";

export const setupSecurityMiddleware = (app: Express) => {
    app.disable("x-powered-by");

    const isDev = ENV.NODE_ENV !== "production";

    app.use(
        helmet({
            contentSecurityPolicy: isDev
                ? false
                : {
                      directives: {
                          defaultSrc: ["'self'"],
                          scriptSrc: ["'self'"],
                          styleSrc: ["'self'"],
                          imgSrc: ["'self'", "data:"],
                          connectSrc: ["'self'", ...ENV.CORS_ALLOWED_ORIGINS],
                          fontSrc: ["'self'", "data:"],
                          objectSrc: ["'none'"],
                          baseUri: ["'self'"],
                          frameAncestors: ["'none'"],
                          upgradeInsecureRequests: []
                      }
                  },
            frameguard: { action: "deny" },
            referrerPolicy: { policy: "no-referrer" },
            hsts: isDev ? false : { maxAge: 15552000 }
        })
    );

    app.use(
        cors({
            origin(origin, callback) {
                if (isDev) {
                    callback(null, true);
                } else if (origin === undefined || ENV.CORS_ALLOWED_ORIGINS.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error("Not allowed by CORS"));
                }
            },
            credentials: true,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"]
        })
    );
};
