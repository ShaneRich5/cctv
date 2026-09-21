import js from "@eslint/js";
import prettier from "eslint-config-prettier/flat";
import checkFile from "eslint-plugin-check-file";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist", "coverage"]),

  // TypeScript with type-aware rules everywhere.
  {
    files: ["**/*.{js,ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      // Allow idiomatic handlers such as onClick={() => setOpen(false)}.
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
    },
  },

  // The browser app: hooks (including React Compiler checks), fast refresh
  // boundaries and accessibility.
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },

  // Node tooling.
  {
    files: ["*.config.{js,ts}", "scripts/**/*.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },

  // Plain JS config files aren't part of a TypeScript project.
  {
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // kebab-case file and folder names ("feed-player.tsx", "view.test.ts").
  {
    files: ["**/*.{js,ts,tsx}"],
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.{js,ts,tsx}": "KEBAB_CASE" },
        { ignoreMiddleExtensions: true },
      ],
      "check-file/folder-naming-convention": ["error", { "{src,scripts}/**/": "KEBAB_CASE" }],
    },
  },

  // Formatting is Prettier's job; switch off any rules that would fight it.
  prettier,
]);
