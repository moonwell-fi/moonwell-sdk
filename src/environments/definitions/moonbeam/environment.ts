import { http, fallback } from "viem";
import { moonbeam } from "viem/chains";
import { createEnvironmentConfig } from "../../types/config.js";
import { contracts } from "./contracts.js";
import { markets } from "./core-markets.js";
import { custom } from "./custom.js";
import { tokens } from "./tokens.js";

const createEnvironment = (
  rpcUrls?: string[],
  indexerUrl?: string,
  governanceIndexerUrl?: string,
) =>
  createEnvironmentConfig({
    key: "moonbeam",
    name: "Moonbeam",
    chain: {
      ...moonbeam,
      rpcUrls: {
        default: { http: rpcUrls || ["https://rpc.moonwell.fi/main/evm/1284"] },
      },
    },
    transport: rpcUrls
      ? fallback(rpcUrls.map((url) => http(url)))
      : http("https://rpc.moonwell.fi/main/evm/1284"),
    indexerUrl: indexerUrl || "https://ponder.moonwell.fi",
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
