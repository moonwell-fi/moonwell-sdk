import { http, defineChain, fallback } from "viem";
import { base as baseChain } from "viem/chains";
import { DEFAULT_LUNAR_INDEXER_URL } from "../../../common/lunar-indexer-helpers.js";
import {
  type Environment,
  createEnvironmentConfig,
} from "../../types/config.js";
import { contracts } from "./contracts.js";
import { markets } from "./core-markets.js";
import { custom } from "./custom.js";
import { morphoMarkets } from "./morpho-markets.js";
import { vaults } from "./morpho-vaults.js";
import { tokens } from "./tokens.js";

const base = defineChain({ ...baseChain, testnet: false });

const createEnvironment = (
  rpcUrls?: string[],
  governanceIndexerUrl?: string,
  lunarIndexerUrl?: string,
): Environment<
  typeof tokens,
  typeof markets,
  typeof vaults,
  typeof contracts,
  typeof custom
> =>
  createEnvironmentConfig({
    key: "base",
    name: "Base",
    chain: {
      ...base,
      rpcUrls: {
        default: { http: rpcUrls || ["https://rpc.moonwell.fi/main/evm/8453"] },
      },
    },
    transport: rpcUrls
      ? fallback(rpcUrls.map((url) => http(url)))
      : http("https://rpc.moonwell.fi/main/evm/8453"),
    governanceIndexerUrl:
      governanceIndexerUrl ||
      "https://lunar-services-worker.moonwell.workers.dev",
    lunarIndexerUrl: lunarIndexerUrl || DEFAULT_LUNAR_INDEXER_URL,
    tokens,
    markets,
    vaults,
    morphoMarkets,
    contracts,
    custom,
  }) as Environment<
    typeof tokens,
    typeof markets,
    typeof vaults,
    typeof contracts,
    typeof custom
  >;

export { base, createEnvironment, markets, morphoMarkets, tokens, vaults };
