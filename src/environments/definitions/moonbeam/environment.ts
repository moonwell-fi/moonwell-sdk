import { http, fallback } from "viem";
import { moonbeam } from "viem/chains";
import { createEnvironmentConfig } from "../../types/config.js";
import { contracts } from "./contracts.js";
import { markets } from "./core-markets.js";
import { custom } from "./custom.js";
import { tokens } from "./tokens.js";

// Public fallback RPCs for Moonbeam — used when the primary rpc.moonwell.fi/main/evm/1284
// endpoint is degraded. Ordered by reliability: Moonbeam Foundation first, then
// Blast API, then PublicNode. The viem `fallback` transport retries the list in order.
const MOONBEAM_FALLBACK_RPCS = [
  "https://rpc.api.moonbeam.network",
  "https://moonbeam.public.blastapi.io",
  "https://moonbeam-rpc.publicnode.com",
];

const createEnvironment = (
  rpcUrls?: string[],
  governanceIndexerUrl?: string,
  lunarIndexerUrl?: string,
) =>
  createEnvironmentConfig({
    key: "moonbeam",
    name: "Moonbeam",
    chain: {
      ...moonbeam,
      rpcUrls: {
        default: { http: rpcUrls || ["https://rpc.moonwell.fi/main/evm/1284", ...MOONBEAM_FALLBACK_RPCS] },
      },
    },
    transport: rpcUrls
      ? fallback(rpcUrls.map((url) => http(url)))
      : fallback([
          http("https://rpc.moonwell.fi/main/evm/1284"),
          ...MOONBEAM_FALLBACK_RPCS.map((url) => http(url)),
        ]),
    lunarIndexerUrl:
      lunarIndexerUrl || "https://lunar-services-worker.moonwell.workers.dev",
    governanceIndexerUrl:
      governanceIndexerUrl ||
      "https://lunar-services-worker.moonwell.workers.dev",
    tokens,
    markets,
    vaults: {},
    morphoMarkets: {},
    contracts,
    custom,
  });

export { moonbeam, createEnvironment, markets, tokens };
