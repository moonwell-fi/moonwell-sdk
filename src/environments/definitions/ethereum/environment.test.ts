import { base, mainnet, moonbeam, optimism } from "viem/chains";
import { describe, expect, test } from "vitest";
import { publicEnvironments } from "../../index.js";
import { GovernanceTokensConfig } from "../governance.js";
import { createEnvironment, ethereum } from "./environment.js";

// Locks the invariants the WELL-to-Ethereum bridge relies on so silent
// regressions (e.g. someone bumping viem and `testnet` flipping back to
// `undefined`, or `custom: custom` being reset to `custom: {}` in
// environment.ts) get caught at unit-test time rather than in the frontend.
describe("ethereum environment invariants", () => {
  test("chain.testnet is strictly false", () => {
    expect(ethereum.testnet).toBe(false);

    const env = createEnvironment();
    expect(env.chain.testnet).toBe(false);
  });

  test("custom config flows through createEnvironment", () => {
    const env = createEnvironment();

    expect(env.custom.governance.token).toBe("WELL");
    expect(env.custom.wormhole.chainId).toBe(2);
    expect(env.custom.wormhole.tokenBridge.address).toBe(
      "0x3ee18B2214AFF97000D974cf647E654bB5f1d8A8",
    );
    expect(env.custom.xWELL.bridgeAdapter.address).toBe(
      "0x734AbBCe07679C9A6B4Fe3bC16325e028fA6DbB7",
    );
  });

  test("WELL token address matches the canonical xWELL OFT", () => {
    const env = createEnvironment();

    expect(env.config.tokens.WELL.address).toBe(
      "0xA88594D404727625A9437C3f886C7643872296AE",
    );
  });

  test("default indexer URLs are wired when createEnvironment is called with no args", () => {
    const env = createEnvironment();

    expect(env.lunarIndexerUrl).toBe(
      "https://lunar-services-worker.moonwell.workers.dev",
    );
    expect(env.governanceIndexerUrl).toBe(
      "https://lunar-services-worker.moonwell.workers.dev",
    );
  });

  test("WELL governance token is registered on every chain that holds it", () => {
    // Moonbeam dropped with the sunset (MOO-551) — a halted chain can't answer
    // voting-power reads, so it must not be advertised as holding WELL.
    expect(GovernanceTokensConfig.WELL.chainIds).toEqual(
      expect.arrayContaining([base.id, optimism.id, mainnet.id]),
    );
    expect(GovernanceTokensConfig.WELL.chainIds).not.toContain(moonbeam.id);
  });

  // Locks the 4 launch Core markets so reverting `markets: markets` back to
  // `markets: {}`, dropping a market, or transposing an mToken/underlying
  // mapping fails CI instead of silently regressing `getMarkets()` for chain 1.
  test("core markets are registered with the correct underlying mapping", () => {
    const env = createEnvironment();

    expect(env.config.markets).toMatchObject({
      // Presented as native ETH (zeroAddress) — see core-markets.ts for the
      // rationale; mirrors Base/Optimism convention (key + symbol "mETH").
      MOONWELL_ETH: { marketToken: "MOONWELL_ETH", underlyingToken: "ETH" },
      MOONWELL_USDC: { marketToken: "MOONWELL_USDC", underlyingToken: "USDC" },
      MOONWELL_USDT: { marketToken: "MOONWELL_USDT", underlyingToken: "USDT" },
      MOONWELL_cbBTC: {
        marketToken: "MOONWELL_cbBTC",
        underlyingToken: "cbBTC",
      },
    });
    expect(Object.keys(env.config.markets)).toHaveLength(4);
  });

  // Ethereum's MultiRewardDistributor (the comptroller's `rewardDistributor()`,
  // MRD_PROXY from MIP-E00) was historically omitted from this config. The SDK
  // never reads it directly (reward APRs come from the `views` contract), but
  // the frontend's reward-claim flow branches on its presence — absent, an
  // Ethereum claim falls back to the Moonbeam `0x…0808` precompile path and
  // reverts. Lock the address so dropping it fails CI rather than silently
  // re-breaking claims (mirrors the Base/Optimism convention of defining it).
  test("multiRewardDistributor is wired with the on-chain MRD_PROXY address", () => {
    const env = createEnvironment();

    expect(env.config.contracts.multiRewardDistributor).toBe(
      "0x60142B8d76FaC5b88cfB422Ba1aA905d2171851c",
    );
    expect(env.contracts.multiRewardDistributor.address).toBe(
      "0x60142B8d76FaC5b88cfB422Ba1aA905d2171851c",
    );
  });

  // `custom.governance.chainIds` is consumed as a `homeEnvironment` membership
  // predicate by core/markets and user-rewards (see
  // src/actions/core/user-rewards/common.ts:21). Moonbeam used to own Base and
  // Optimism there, which meant their native-token reward pricing was read from
  // Moonbeam's views contract. With Moonbeam gone (MOO-551) each chain resolves
  // its home env to itself via the `|| environment` fallback — so no surviving
  // env may claim another chain's markets, or it would silently re-point that
  // chain's native-token pricing at the wrong views contract.
  test("no environment claims a foreign chain as its governance home", () => {
    const claimed = Object.values(publicEnvironments).flatMap((e) => {
      const chainIds: readonly number[] | undefined =
        e.custom && "governance" in e.custom
          ? e.custom.governance?.chainIds
          : undefined;
      return (chainIds ?? []).filter((id) => id !== e.chainId);
    });
    expect(claimed).toEqual([]);
  });

  // Ethereum hub MultichainGovernor (0x8769B70ac7c93AF0e75de0D69877709B66d75838)
  // registers Wormhole chain IDs 16 (Moonbeam), 30 (Base), 24 (Optimism) as
  // vote-collection chains. The SDK must mirror that set: each satellite env
  // needs both `custom.wormhole.chainId` and `contracts.voteCollector`. A
  // missing `wormhole` block on any of them is the bug that motivated this
  // test — Optimism previously had no wormhole config and would have been
  // silently dropped from any future satellite enumeration.
  test("Base and Optimism are wired as Ethereum-hub satellites", () => {
    const satelliteChainIds = (
      Object.values(publicEnvironments) as Array<{
        chainId: number;
        custom?: { wormhole?: { chainId?: number } };
        contracts?: { voteCollector?: unknown };
      }>
    )
      .filter((env) => {
        if (env.chainId === mainnet.id) return false;
        return !!(
          env.custom?.wormhole?.chainId && env.contracts?.voteCollector
        );
      })
      .map((env) => env.chainId);

    // Moonbeam (Wormhole chain 16) is still registered on the hub contract, but
    // the SDK no longer carries an environment for it (MOO-551), so only the two
    // live satellites can be enumerated.
    expect(satelliteChainIds).toEqual(
      expect.arrayContaining([base.id, optimism.id]),
    );
    expect(satelliteChainIds).toHaveLength(2);
  });
});
