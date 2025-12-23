import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^.+\\.(css|scss|sass)$": "<rootDir>/__mocks__/styleMock.ts",
    "^.+\\.(gif|jpg|jpeg|png|svg|webp)$": "<rootDir>/__mocks__/fileMock.ts",
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "src/core/domain/**/*.{ts,tsx}",
    "src/core/usecases/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/", "/__tests__/"],
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.json",
    },
  },
};

export default config;
