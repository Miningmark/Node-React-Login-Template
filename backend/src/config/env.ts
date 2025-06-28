import { z } from "zod/v4";
import "dotenv/config";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]),

    CONSOLE_LOG_DATABASE_QUERRIES: z.string().transform((val) => val === "true"),
    CONSOLE_LOG_ERRORS: z.string().transform((val) => val === "true"),

    ENABLE_REGISTER: z.string().transform((val) => val === "true"),
    ENABLE_USERNAME_CHANGE: z.string().transform((val) => val === "true"),

    BACKEND_PORT: z.string().transform(Number),
    BACKEND_VERSION: z.string(),
    API_VERSION: z.string(),

    SUPER_ADMIN_PASSWORD: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,24}$/),

    FRONTEND_URL: z.string().url(),

    ACCOUNT_ACTIVATION_USER_EXPIRY: z.string().regex(/^\d+[smhd]$/),
    ACCOUNT_ACTIVATION_ADMIN_EXPIRY: z.string().regex(/^\d+[smhd]$/),
    PASSWORD_RESET_EXPIRY: z.string().regex(/^\d+[smhd]$/),

    ACCESS_TOKEN_SECRET: z.string().min(32),
    ACCESS_TOKEN_EXPIRY: z.string().regex(/^\d+[smhd]$/),

    REFRESH_TOKEN_SECRET: z.string().min(32),
    REFRESH_TOKEN_EXPIRY: z.string().regex(/^\d+[smhd]$/),

    CORS_ALLOWED_ORIGINS: z
        .string()
        .transform((str) => str.split(",").map((s) => s.trim()))
        .refine((arr) => arr.every((origin) => /^https?:\/\/.+$/.test(origin))),

    DEFAULT_DATABASE_HOST: z.string(),
    DEFAULT_DATABASE_PORT: z.string().transform(Number),
    DEFAULT_DATABASE_USERNAME: z.string(),
    DEFAULT_DATABASE_PASSWORD: z.string(),
    DEFAULT_DATABASE_NAME: z.string(),

    SMTP_HOST: z.string(),
    SMTP_PORT: z.string().transform(Number),
    SMTP_USER: z.string(),
    SMTP_PASSWORD: z.string()
});

export const ENV = envSchema.parse(process.env);
