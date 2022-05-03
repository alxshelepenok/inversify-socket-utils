import type { Config } from "@jest/types";

import swc from "./swc-config";

const jestConfig: Config.InitialOptions = {
  rootDir: "../../",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/?(*.)test.ts"],
  testPathIgnorePatterns: ["node_modules", "internal", "target", "examples"],
  transform: { "^.+\\.ts$": ["@swc/jest", swc] },
};

export default jestConfig;
