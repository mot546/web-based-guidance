import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals"; // 1. Import globals

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
      sourceType: "module",
      ecmaVersion: "latest",
      globals: {
        ...globals.browser, // 2. This fixes 'document', 'window', 'localStorage' warnings
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "import/extensions": "off",
      "import/no-extraneous-dependencies": "off",
      "no-underscore-dangle": ["error", { allow: ["__filename", "__dirname"] }],
      
      // 3. Add these specific overrides to fix your 12 errors:
      "no-param-reassign": ["error", { "props": false }], // Allows root.innerHTML = ...
      "import/prefer-default-export": "off",              // Allows named exports
      "no-use-before-define": "off",                      // Allows calling functions before they are written
      "no-alert": "off",                                  // Allows alert()
      "consistent-return": "off"                          // Stops demanding 'return' in all paths
    },
  },
  eslintConfigPrettier,
];
