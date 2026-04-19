import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  js.configs.recommended,
  ...compat.extends("eslint-config-airbnb-base"), 
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "module", // This fixes the "Unexpected token import" error
      ecmaVersion: "latest",
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "import/extensions": "off", // Fixes the "Unexpected use of file extension" error
      "import/no-extraneous-dependencies": "off",
      "no-underscore-dangle": ["error", { "allow": ["__filename", "__dirname"] }],
    },
  },
  eslintConfigPrettier, 
];
