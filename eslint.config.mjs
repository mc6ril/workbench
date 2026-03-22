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
  // Layer boundary guardrails for strict Clean Architecture
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "../../*", "../../../*", "../../../../*"],
              message:
                "Use absolute imports with @/ prefix instead of relative imports from src/",
            },
            {
              group: ["@/presentation/**"],
              message:
                "Shared layer must not import presentation layer modules.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/domains/*/core/**/*", "src/modules/*/core/**/*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "../../*", "../../../*", "../../../../*"],
              message:
                "Use absolute imports with @/ prefix instead of relative imports from src/",
            },
            // Keep @/shared/featureAccess importable from domains/modules during the transition.
            {
              group: ["@/presentation/**", "@/shared/i18n/**"],
              message:
                "Core layer must remain framework-agnostic and cannot import presentation or shared i18n modules.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/domains/*/infrastructure/**/*",
      "src/modules/*/infrastructure/**/*",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "../../*", "../../../*", "../../../../*"],
              message:
                "Use absolute imports with @/ prefix instead of relative imports from src/",
            },
            {
              group: ["@/configs/**"],
              message:
                "Infrastructure layer must not pull dependencies from global configs singletons.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/domains/*/presentation/**/*",
      "src/modules/*/presentation/**/*",
    ],
    rules: {
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
  {
    files: [
      "src/app/**/page.tsx",
      "src/app/**/layout.tsx",
      "src/app/**/loading.tsx",
      "src/app/**/error.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "../../*", "../../../*", "../../../../*"],
              message:
                "Use absolute imports with @/ prefix instead of relative imports from src/",
            },
            {
              group: [
                "@/domains/*/infrastructure/**",
                "@/modules/*/infrastructure/**",
              ],
              message:
                "App route UI files must not import infrastructure directly.",
            },
            {
              group: [
                "@/domains/*/core/usecases/**",
                "@/modules/*/core/usecases/**",
              ],
              message:
                "App route UI files must go through presentation/domain entry points instead of core usecases.",
            },
          ],
        },
      ],
    },
  },
  // No additional restrictions for src/app/**/route.ts on purpose:
  // webhooks and callback handlers legitimately orchestrate infrastructure and usecases.
  {
    files: ["src/**/*"],
    ignores: ["src/domains/workspace/core/domain/schema/project.schema.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/domains/workspace/core/domain/schema/project.schema"],
              message:
                "Import depuis @/domains/project/core/domain/schema/project.schema à la place",
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
      // 2. Types / domain (@/domains/project-management/core/domain)
      // 3. Usecases (@/domains/project-management/core/usecases)
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
            // Domain types (@/domains/project-management/core/domain)
            ["^@/domains/project-management/core/domain"],
            // Usecases (@/domains/project-management/core/usecases)
            ["^@/domains/project-management/core/usecases"],
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
