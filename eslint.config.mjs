import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "node_modules/**",
    "next-env.d.ts",
  ]),
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        alert: "readonly",
        confirm: "readonly",
        console: "readonly",
        document: "readonly",
        fetch: "readonly",
        FormData: "readonly",
        IntersectionObserver: "readonly",
        process: "readonly",
        require: "readonly",
        Response: "readonly",
        URL: "readonly",
        window: "readonly",
      },
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": "off",
    },
  },
]);
