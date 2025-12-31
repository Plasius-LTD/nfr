import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
    pool: "forks",
    globalSetup: "./tests/setup/global-setup.ts",
    setupFiles: ["./tests/setup/vm-constants.ts"],
    environmentOptions: {
      jsdom: {
        runScripts: undefined,
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage",
      exclude: [
        "tests/**",
        "dist/**",
        "**/*.config.{js,ts}",
        "**/.eslintrc.{js,cjs}",
      ],
    },
  },
});
