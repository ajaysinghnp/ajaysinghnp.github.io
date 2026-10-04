import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  /* ------------------------------------------------------------------ */
  /* Base: Next.js (React, hooks, a11y, Core Web Vitals) + TypeScript    */
  /* ------------------------------------------------------------------ */
  ...nextVitals,
  ...nextTs,

  /* ------------------------------------------------------------------ */
  /* Ignores                                                             */
  /* ------------------------------------------------------------------ */
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "node_modules/**",
    "public/**",
    "next-env.d.ts",
    "**/*.min.js",
    "**/generated/**",
  ]),

  /* ------------------------------------------------------------------ */
  /* Project-wide rules                                                  */
  /* ------------------------------------------------------------------ */
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
      unicorn,
    },
    rules: {
      /* --- Correctness --- */
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-debugger": "error",
      "no-alert": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      "no-else-return": ["error", { allowElseIf: false }],
      "no-nested-ternary": "warn",
      "object-shorthand": ["error", "always"],
      "prefer-template": "error",
      curly: ["error", "multi-line"],

      /* --- Unused code (unused-imports can auto-remove imports) --- */
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      /* --- TypeScript --- */
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": true,
          minimumDescriptionLength: 10,
        },
      ],
      "@typescript-eslint/naming-convention": [
        "warn",
        { selector: "typeLike", format: ["PascalCase"] },
        {
          selector: "variable",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
      ],

      /* --- Imports: sorted, deduplicated, no cycles into itself --- */
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^\\u0000"], // side-effect imports
            ["^react$", "^next(/.*)?$"], // react + next first
            ["^@?\\w"], // third-party packages
            ["^@/"], // project alias
            ["^\\."], // relative imports
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      "import/no-duplicates": "error",
      "import/first": "error",
      "import/newline-after-import": "error",

      /* --- React --- */
      "react/jsx-no-comment-textnodes": "off", // decorative "// text" labels are intentional
      "react/self-closing-comp": "error",
      "react/jsx-no-useless-fragment": ["warn", { allowExpressions: true }],
      "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],
      "react/jsx-boolean-value": ["error", "never"],
      "react/no-array-index-key": "warn",
      "react-hooks/exhaustive-deps": "error",

      /* --- File naming: kebab-case everywhere --- */
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
          ignore: [/^\[.+\]/, /\.d\.ts$/],
        },
      ],
      "unicorn/prefer-node-protocol": "error",
    },
  },

  /* ------------------------------------------------------------------ */
  /* Type-aware rules (TS only). Remove this block if lint feels slow.    */
  /* ------------------------------------------------------------------ */
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
    },
  },

  /* ------------------------------------------------------------------ */
  /* Scripts and config files (Node context)                             */
  /* ------------------------------------------------------------------ */
  {
    files: ["scripts/**/*.{js,mjs,cjs,ts}", "*.config.{js,mjs,cjs,ts}"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/naming-convention": "off",
    },
  },

  /* ------------------------------------------------------------------ */
  /* Tests                                                               */
  /* ------------------------------------------------------------------ */
  {
    files: ["**/*.{test,spec}.{ts,tsx}", "**/__tests__/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "no-console": "off",
    },
  },

  /* ------------------------------------------------------------------ */
  /* Prettier must be last: turns off rules that conflict with formatting */
  /* ------------------------------------------------------------------ */
  eslintConfigPrettier,
]);

export default eslintConfig;
