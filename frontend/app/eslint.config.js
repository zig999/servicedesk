// Flat configuration for the `lint` step this project's standard
// (frontend-typescript.yaml) declares. Encodes every lint-decided rule stock
// eslint, typescript-eslint, eslint-plugin-jsx-a11y, eslint-plugin-react and
// eslint-plugin-testing-library can decide today. A rule with no exact stock
// equivalent -- PRF-01's lazy-loaded-route check, PRH-02's reference-carrying
// marker, PRH-03's reasoned suppression, TST-04's file-beside-its-unit
// placement, and the file-name-casing half of CON-01 -- stays a reading,
// the same way the backend's own eslint.config.js leaves file-name casing.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import testingLibrary from "eslint-plugin-testing-library";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  {
    // Applies to every file this config lints (no `files` restriction), unlike the
    // src/**/*.{ts,tsx} block below whose own `settings` only covers app source.
    // react.configs.flat.recommended below is likewise unrestricted, so it reaches
    // eslint.config.js, vite.config.ts, playwright.config.ts and stylelint.config.js
    // too; without a version here those files lint with no react settings at all,
    // which is what printed "React version not specified in eslint-plugin-react
    // settings" once per run.
    settings: {
      react: { version: "detect" },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: globals.browser,
    },
    settings: {
      react: { version: "19.0" },
    },
    rules: {
      // ACC-01, ACC-02, ACC-03 come from jsxA11y.flatConfigs.recommended above.

      // CON-01 -- identifier casing (file-name casing has no stock rule and stays a reading).
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "typeLike", format: ["PascalCase"] },
        { selector: "variableLike", format: ["camelCase", "PascalCase"] },
        { selector: "parameter", format: ["camelCase"], leadingUnderscore: "allow" },
        {
          selector: "variable",
          modifiers: ["const"],
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
        },
      ],

      "no-restricted-syntax": [
        "error",
        {
          // ENV-01 -- client source reads configuration through import.meta.env, never process.env.
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message:
            "Read configuration through import.meta.env, never process.env, in client source (ENV-01).",
        },
        {
          // SEC-04 -- an auth token is not persisted in script-reachable storage without a recorded reason.
          selector:
            "CallExpression[callee.object.name=/^(localStorage|sessionStorage)$/][callee.property.name='setItem']",
          message:
            "An authentication token is not persisted in storage reachable by arbitrary script unless the project's own decision records why (SEC-04).",
        },
        {
          // PRF-03 -- a large third-party module is imported by named export, never as a whole namespace.
          selector: "ImportNamespaceSpecifier",
          message:
            "Import a large third-party module by named export for tree-shaking, never as a whole namespace (PRF-03).",
        },
      ],

      // MNT-01 -- a component file stays within three hundred lines.
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],

      // MNT-04 -- a dynamic list is keyed by a stable identifier, never by its array index.
      "react/no-array-index-key": "error",

      // MNT-05 -- an import no longer used is removed.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],

      // PRH-01 -- production code emits through the configured logger; no direct console call.
      "no-console": "error",

      // PRH-04 -- an inline style prop is not used for visual styling.
      "react/forbid-dom-props": ["error", { forbid: ["style"] }],

      // SEC-01 -- raw HTML rendered from data this project did not author is sanitized first.
      "react/no-danger": "error",
      "react/no-danger-with-children": "error",

      // SEC-02 -- no construct evaluates a string as code or navigates to one.
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-script-url": "error",

      // TYP-02 -- a type assertion is never used to silence the compiler without a guard.
      // A stock rule cannot verify a guard accompanies one, so every assertion is flagged;
      // a genuinely guarded one is suppressed with the reason PRH-03 requires.
      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],

      // TYP-03 -- a component's public props are declared through an explicit, exported type.
      "@typescript-eslint/explicit-module-boundary-types": "error",
    },
  },
  {
    files: ["src/**/*.spec.{ts,tsx}"],
    ...testingLibrary.configs["flat/react"],
  },
  {
    // vite.config.ts and playwright.config.ts run under Node, not the browser.
    files: ["vite.config.ts", "playwright.config.ts", "eslint.config.js", "stylelint.config.js", "stylelint-rules/**/*.js"],
    languageOptions: { globals: globals.node },
  },
);
