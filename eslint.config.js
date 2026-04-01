import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import pluginN from "eslint-plugin-n";
import unicorn from "eslint-plugin-unicorn";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "playwright", "playwright-report", "coverage", "coverage-ct"]),
  {
    files: ["**/*.{js,ts,tsx}"],
    plugins: { n: pluginN, unicorn },
    rules: {
      "n/prefer-node-protocol": "error",
      "prefer-regex-literals": ["error", { disallowRedundantWrapping: true }],
      "unicorn/prefer-at": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector:
            'CallExpression[callee.property.name="match"]:has(> Literal.arguments[regex])',
          message: "Prefer RegExp.exec() over String.match().",
        },
      ],
      "unicorn/no-zero-fractions": "error",
    },
  },
  {
    files: ["**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            'ObjectPattern[typeAnnotation.typeAnnotation.type="TSTypeLiteral"]',
          message:
            "Wrap component props in Readonly<{ ... }> to prevent prop mutation.",
        },
        {
          selector: 'TSTypeAliasDeclaration[id.name="Props"] > TSTypeLiteral',
          message:
            "Use type Props = Readonly<{ ... }> to prevent prop mutation.",
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "no-negated-condition": "error",
      "no-nested-ternary": "error",
      "no-restricted-globals": [
        "error",
        { name: "parseInt", message: "Use Number.parseInt instead." },
        { name: "parseFloat", message: "Use Number.parseFloat instead." },
        { name: "isNaN", message: "Use Number.isNaN instead." },
        { name: "isFinite", message: "Use Number.isFinite instead." },
      ],
    },
  },
]);
