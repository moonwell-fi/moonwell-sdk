import { http, defineChain, fallback } from "viem";
import { base as baseChain } from "viem/chains";
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
  indexerUrl?: string,
  governanceIndexerUrl?: string,
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
        default: { http: rpcUrls || base.rpcUrls.default.http },
      },
    },
    transport: rpcUrls
      ? fallback(rpcUrls.map((url) => http(url)))
      : fallback([
          http(base.rpcUrls.default.http[0]),
          http("https://base.llamarpc.com"),
          http("https://base-mainnet.public.blastapi.io"),
          http("https://base.lava.build"),
        ]),
    indexerUrl: indexerUrl || "https://ponder.moonwell.fi",
    governanceIndexerUrl: governanceIndexerUrl || "https://ponder.moonwell.fi",
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
