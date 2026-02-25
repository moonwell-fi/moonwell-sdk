import { http, fallback } from "viem";
import { arbitrum } from "viem/chains";
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
    key: "arbitrum",
    name: "Arbitrum",
    chain: {
      ...arbitrum,
      rpcUrls: {
        default: {
          http: rpcUrls || ["https://rpc.moonwell.fi/main/evm/42161"],
        },
      },
    },
    transport: rpcUrls
      ? fallback(rpcUrls.map((url) => http(url)))
      : http("https://rpc.moonwell.fi/main/evm/42161"),
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

export { arbitrum, createEnvironment, tokens };
