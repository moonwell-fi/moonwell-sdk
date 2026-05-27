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
      reporter: process.env.CI
        ? ["lcov", "json-summary"]
        : ["text", "json", "html", "json-summary"],
      reportsDirectory: "./coverage",
      reportOnFailure: true,
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
      "src/**/getBeamTokenLimits.test.ts",
      "src/actions/core/markets/getMarketSnapshots.test.ts",
      "src/actions/core/markets/common.test.ts",
      "src/actions/morpho/**/*.test.ts",
      "src/actions/lunar-indexer-client.test.ts",
      "src/actions/governance/getMerklRewardsData.test.ts",
      "src/actions/governance/getCirculatingSupplySnapshots.test.ts",
      "src/actions/governance/getStakingSnapshots.test.ts",
      "src/actions/governance/getUserVotingPowers.test.ts",
      "src/actions/governance/getUserVoteReceipt.test.ts",
      "src/actions/governance/governor-api-client.test.ts",
      "src/actions/governance/ipfs.test.ts",
      "src/actions/governance/proposals/common.test.ts",
      "src/actions/governance/proposals/getProposal.test.ts",
      "src/actions/governance/proposals/getProposals.test.ts",
      "src/actions/core/user-positions/getUserPositionSnapshots.test.ts",
      "src/client/createMoonwellClient.test.ts",
      "src/common/getBlockNumberAtTimestamp.test.ts",
      "src/environments/definitions/ethereum/environment.test.ts",
    ],
    setupFiles: [join(__dirname, "./setup.ts")],
    hookTimeout: 60_000,
    testTimeout: 60_000,
  },
});
