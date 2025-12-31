import vm from "node:vm";
import { defineConfig } from "vitest/config";

// Some Node builds omit vm.constants; jsdom expects DONT_CONTEXTIFY to exist.
if (!vm.constants || !vm.constants.DONT_CONTEXTIFY) {
  vm.constants = { ...(vm.constants || {}), DONT_CONTEXTIFY: Symbol.for("dont-contextify") };
}

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
    pool: "forks",
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
