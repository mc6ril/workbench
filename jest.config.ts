import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    // Map SCSS/CSS files first (before path aliases)
    "^.+\\.(css|scss|sass)$": "<rootDir>/__mocks__/styleMock.ts",
    "^.+\\.(gif|jpg|jpeg|png|svg|webp)$": "<rootDir>/__mocks__/fileMock.ts",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/__tests__/setupTests.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/core/usecases/**/*.{ts,tsx}",
    "src/infrastructure/**/*.{ts,tsx}",
    "src/presentation/components/**/*.{ts,tsx}",
    "src/shared/**/*.{ts,tsx}",
    "src/utils/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/", "/__tests__/"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json",
      },
    ],
  },
};

export default config;
