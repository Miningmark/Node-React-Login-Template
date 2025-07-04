import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src/")
        }
    },
    test: {
        setupFiles: ["tests/setup/setupDB.ts"],
        sequence: {
            concurrent: false
        },
        globals: true,
        environment: "node",
        include: ["tests/**/*.test.ts"],
        coverage: {
            enabled: true,
            provider: "v8",
            reportsDirectory: "./coverage",
            reporter: ["html"],
            exclude: ["tests/", "**/*.test.ts"]
        }
    }
});
