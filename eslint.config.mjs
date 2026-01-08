import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated coverage files
    "coverage/**",
  ]),
  // Custom rules aligned with project conventions
  {
    rules: {
      // Prevent usage of 'any' type
      "@typescript-eslint/no-explicit-any": "error",
      // Enforce braces for all control statements
      curly: ["error", "all"],
      // Prefer arrow functions for callbacks
      "prefer-arrow-callback": "error",
      // Prefer 'type' over 'interface' for type definitions (props, objects, etc.)
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      // Remove unused imports
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // Prevent relative imports from src/ (enforce @/ prefix)
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "../../*", "../../../*", "../../../../*"],
              message:
                "Use absolute imports with @/ prefix instead of relative imports from src/",
            },
          ],
        },
      ],
    },
  },
  // Import ordering plugin configuration
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // Disable default sort-imports rule in favor of simple-import-sort
      "sort-imports": "off",
      // Configure import ordering to match project conventions:
      // 1. External libraries (React, Zustand, React Query…)
      // 2. Types / domain (@/core/domain)
      // 3. Usecases (@/core/usecases)
      // 4. Infrastructure (@/infrastructure)
      // 5. Presentation (@/presentation)
      // 6. Styles (@/styles)
      // 7. Relative imports
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // External libraries (React, Next.js, etc.)
            ["^react", "^next", "^@?\\w"],
            // Domain types (@/core/domain)
            ["^@/core/domain"],
            // Usecases (@/core/usecases)
            ["^@/core/usecases"],
            // Infrastructure (@/infrastructure)
            ["^@/infrastructure"],
            // Presentation (@/presentation)
            ["^@/presentation"],
            // Styles (@/styles)
            ["^@/styles"],
            // Shared (@/shared)
            ["^@/shared"],
            // Relative imports
            ["^\\."],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
  // Disable ESLint formatting rules that conflict with Prettier
  // Must be last to override any conflicting rules
  eslintConfigPrettier,
]);

export default eslintConfig;
