import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import z from "zod/v4";

import { ErrorMonitoringService } from "@/services/ServerErrorMonitoring.service";

import { setupSecurityMiddleware } from "@/middlewares/security.middleware";
import { notFoundMiddleware } from "@/middlewares/notFound.middleware";
import { errorHandlerMiddleware } from "@/middlewares/errorHandler.middleware";

import { ENV } from "@/config/env";

import authRoutes from "@/routes/auth.routes";

const app = express();

ErrorMonitoringService.getInstance();

z.config(z.locales.de());

setupSecurityMiddleware(app);
app.use(cors({ credentials: true }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/" + ENV.API_VERSION + "/users", authRoutes);

app.use(notFoundMiddleware);

app.use(errorHandlerMiddleware);

export default app;
