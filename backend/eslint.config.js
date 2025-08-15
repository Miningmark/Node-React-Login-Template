import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginImport from "eslint-plugin-import";

export default [
    { ignores: ["dist", "node_modules"] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    pluginImport.flatConfigs.recommended,
    eslintConfigPrettier,

    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: { project: "./tsconfig.json" }
        },
        settings: {
            "import/resolver": {
                typescript: { alwaysTryTypes: true }
            }
        },
        rules: {
            "no-console": ["warn", { allow: ["warn", "error"] }],
            "import/order": [
                "warn",
                {
                    groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
                    "newlines-between": "always"
                }
            ],
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
        }
    }
];
