import { http, fallback } from "viem";
import { avalanche } from "viem/chains";
import {
  type Environment,
  createEnvironmentConfig,
} from "../../types/config.js";
import { tokens } from "./tokens.js";

const createEnvironment = (
  rpcUrls?: string[],
  indexerUrl?: string,
  governanceIndexerUrl?: string,
): Environment<typeof tokens, {}, {}, {}, {}> =>
  createEnvironmentConfig({
    key: "avalanche",
    name: "Avalanche",
    chain: {
      ...avalanche,
      rpcUrls: {
        default: {
          http: rpcUrls || ["https://rpc.moonwell.fi/main/evm/43114"],
        },
      },
    },
    transport: rpcUrls
      ? fallback(rpcUrls.map((url) => http(url)))
      : http("https://rpc.moonwell.fi/main/evm/43114"),
    indexerUrl: indexerUrl || "https://ponder.moonwell.fi",
    governanceIndexerUrl:
      governanceIndexerUrl ||
      "https://lunar-services-worker.moonwell.workers.dev",
    tokens,
    markets: {},
    vaults: {},
    morphoMarkets: {},
    contracts: {},
    custom: {},
  }) as Environment<typeof tokens, {}, {}, {}, {}>;

export { avalanche, createEnvironment, tokens };
