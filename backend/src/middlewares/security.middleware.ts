import { ENV } from "@/config/env.js";
import cors from "cors";
import { Express } from "express";
import helmet from "helmet";

export const setupSecurityMiddleware = (app: Express) => {
    app.disable("x-powered-by");

    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", ENV.FRONTEND_URL],
                    fontSrc: ["'self'", "https:", "data:"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'none'"],
                    frameSrc: ["'none'"],
                    frameAncestors: ["'none'"],
                    formAction: ["'self'"],
                    ...(ENV.NODE_ENV === "production" ? { pgradeInsecureRequests: [], blockAllMixedContent: [] } : {})
                }
            },
            crossOriginEmbedderPolicy: false,
            crossOriginOpenerPolicy: { policy: "same-origin" },
            crossOriginResourcePolicy: { policy: "same-origin" },

            dnsPrefetchControl: { allow: false },
            frameguard: { action: "deny" },
            hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
            ieNoOpen: true,
            noSniff: true,
            originAgentCluster: true,
            permittedCrossDomainPolicies: { permittedPolicies: "none" },
            referrerPolicy: { policy: "no-referrer" },
            xssFilter: true
        })
    );

    app.use((req, res, next) => {
        res.setHeader("Permissions-Policy", "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("X-XSS-Protection", "1; mode=block");
        next();
    });

    if (ENV.NODE_ENV === "production") {
        app.use((req, res, next) => {
            const origin = req.headers.origin;

            if (origin && ENV.CORS_ALLOWED_ORIGINS.includes(origin)) {
                res.setHeader("Access-Control-Allow-Origin", origin);
            }
            next();
        });
    }

    app.use(
        cors({
            origin(origin, callback) {
                if (ENV.NODE_ENV !== "production") {
                    callback(null, true);
                } else if (origin !== undefined && ENV.CORS_ALLOWED_ORIGINS.indexOf(origin) !== 1) {
                    callback(null, true);
                } else {
                    console.log(origin);
                    callback(new Error("Not allowed by CORS"));
                }
            },
            credentials: true
        })
    );
};
