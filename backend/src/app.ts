import { ENV } from "@/config/env.js";
import { errorHandlerMiddleware } from "@/middlewares/errorHandler.middleware.js";
import { notFoundMiddleware } from "@/middlewares/notFound.middleware.js";
import { setupSecurityMiddleware } from "@/middlewares/security.middleware.js";
import adminPageRoutes from "@/routes/adminPage.route.js";
import authRoutes from "@/routes/auth.route.js";
import userRoutes from "@/routes/user.route.js";
import userManagementRoutes from "@/routes/userManagement.route.js";
import { ErrorMonitoringService } from "@/services/serverErrorMonitoring.service.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import z from "zod/v4";

const app = express();
export default app;

export async function initApp() {
    ErrorMonitoringService.getInstance();

    z.config(z.locales.de());

    setupSecurityMiddleware(app);
    app.use(cors({ credentials: true }));

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cookieParser());

    app.use("/api/" + ENV.API_VERSION + "/auth", authRoutes);
    app.use("/api/" + ENV.API_VERSION + "/user", userRoutes);

    app.use("/api/" + ENV.API_VERSION + "/userManagement", await userManagementRoutes());
    app.use("/api/" + ENV.API_VERSION + "/adminPage", await adminPageRoutes());

    app.use(notFoundMiddleware);

    app.use(errorHandlerMiddleware);
}
