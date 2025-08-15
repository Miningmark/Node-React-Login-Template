import "dotenv/config";
import { z } from "zod";

const durationSchema = z.string().regex(/^\d+(s|m|h|d)$/, "Use format like '15m', '7d'");
const booleanSchema = z.string().transform((val) => val === "true");

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),

    CONSOLE_LOG_DATABASE_QUERRIES: booleanSchema.default("false"),
    CONSOLE_LOG_ERRORS: booleanSchema.default("true"),

    ENABLE_REGISTER: booleanSchema.default("false"),
    ENABLE_USERNAME_CHANGE: booleanSchema.default("false"),

    BACKEND_PORT: z.coerce.number().int().positive().default(3000),
    BACKEND_VERSION: z.string(),
    API_VERSION: z.string(),

    SUPER_ADMIN_PASSWORD: z
        .string()
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,24}$/
        ),

    FRONTEND_NAME: z.string(),
    FRONTEND_URL: z.string().url(),

    ACCOUNT_ACTIVATION_USER_EXPIRY: durationSchema.default("1h"),
    ACCOUNT_ACTIVATION_ADMIN_EXPIRY: durationSchema.default("5d"),
    PASSWORD_RESET_EXPIRY: durationSchema.default("1h"),

    ACCESS_TOKEN_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 chars"),
    ACCESS_TOKEN_EXPIRY: durationSchema.default("15m"),

    REFRESH_TOKEN_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 chars"),
    REFRESH_TOKEN_EXPIRY: durationSchema.default("1d"),

    CORS_ALLOWED_ORIGINS: z
        .string()
        .transform((str) => str.split(",").map((s) => s.trim()))
        .refine((arr) => arr.every((origin) => /^https?:\/\/.+$/.test(origin))),

    DEFAULT_DATABASE_HOST: z.string(),
    DEFAULT_DATABASE_PORT: z.coerce.number().int().positive().default(3306),
    DEFAULT_DATABASE_USERNAME: z.string(),
    DEFAULT_DATABASE_PASSWORD: z.string(),
    DEFAULT_DATABASE_NAME: z.string(),

    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number().int().positive(),
    SMTP_USER: z.string(),
    SMTP_PASSWORD: z.string(),

    S3_BASE_URL: z.string().url(),
    S3_USERNAME: z.string(),
    S3_PASSWORD: z.string()
});

function prettyZodError(error: z.ZodError): string {
    return error.issues
        .map((i) => {
            const path = i.path.join(".");
            return `  • ${path || "<root>"}: ${i.message}`;
        })
        .join("\n");
}

let parsed;
try {
    parsed = envSchema.parse({
        ...process.env,
        BACKEND_VERSION: "pre-0.1.0_ts"
    });
} catch (err) {
    if (err instanceof z.ZodError) {
        const msg =
            "\n❌ Invalid environment configuration:\n" +
            prettyZodError(err) +
            "\n\nFix your .env or deployment secrets and restart.\n";
        console.error(msg);
        process.exit(1);
    }
    throw err;
}

export const ENV = Object.freeze(parsed);
export type Env = z.infer<typeof envSchema>;
