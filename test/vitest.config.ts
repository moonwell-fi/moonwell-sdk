import { join } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  define: { global: "window" },
  test: {
    alias: {
      "~test": join(__dirname, "."),
    },
    benchmark: {
      outputFile: "./bench/report.json",
      reporters: process.env.CI ? "default" : "verbose",
    },
    coverage: {
      all: false,
      provider: "v8",
      reporter: process.env.CI ? ["lcov"] : ["text", "json", "html"],
      exclude: [
        "**/errors/utils.ts",
        "**/_cjs/**",
        "**/_esm/**",
        "**/_types/**",
        "**/*.bench.ts",
        "**/*.bench-d.ts",
        "**/*.test.ts",
        "**/*.test-d.ts",
        "**/test/**",
      ],
    },
    environment: "jsdom",
    include: [
      ...(process.env.TYPES ? ["**/*.bench-d.ts"] : []),
      //"src/**/*.test.ts",
    ],
    setupFiles: [join(__dirname, "./setup.ts")],
    hookTimeout: 60_000,
    testTimeout: 60_000,
  },
});
