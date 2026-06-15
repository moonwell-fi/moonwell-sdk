import { describe, expect, test } from "vitest";
import { publicEnvironments } from "./index.js";

// Runtime companion to the `createContractsConfig` compile-time guard in
// types/config.ts. Every EVM comptroller environment — one that has a
// `comptroller` but no Moonbeam-style on-chain `governor` — must wire a
// `multiRewardDistributor`. Without it the app's reward-claim flow falls back
// to the Moonbeam `0x…0808` precompile `batchAll` path, which reverts on these
// chains (the MOO-413 regression, which shipped on Ethereum). The input type
// enforces this at the `createContractsConfig` call site; this test is the
// universal net — it iterates the wired `publicEnvironments`, so it also covers
// any environment built outside that factory and catches an `as`-cast that
// bypasses the type. Moonbeam/Moonriver use the `governor` + WELL precompile
// reward model and correctly have no MRD, so the `governor` discriminator
// excludes them.
describe("contract config invariants across public environments", () => {
  type ContractRef = { address?: string } | undefined;
  const envs = Object.entries(publicEnvironments) as Array<
    [
      string,
      {
        contracts?: {
          comptroller?: ContractRef;
          governor?: ContractRef;
          multiRewardDistributor?: ContractRef;
        };
      },
    ]
  >;

  const evmComptrollerEnvs = envs.filter(
    ([, env]) => !!env.contracts?.comptroller && !env.contracts?.governor,
  );

  test("Base, Optimism, and Ethereum are detected as EVM comptroller chains", () => {
    expect(evmComptrollerEnvs.map(([key]) => key)).toEqual(
      expect.arrayContaining(["base", "optimism", "ethereum"]),
    );
  });

  test("every EVM comptroller environment defines multiRewardDistributor", () => {
    for (const [key, env] of evmComptrollerEnvs) {
      expect(
        env.contracts?.multiRewardDistributor?.address,
        `${key} is an EVM comptroller chain and must define multiRewardDistributor`,
      ).toMatch(/^0x[0-9a-fA-F]{40}$/);
    }
  });
});
