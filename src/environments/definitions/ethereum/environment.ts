import { http, fallback } from "viem";
import { mainnet as ethereum } from "viem/chains";
import {
  type Environment,
  createEnvironmentConfig,
} from "../../types/config.js";
import { contracts } from "./contracts.js";
import { custom } from "./custom.js";
import { tokens } from "./tokens.js";

const createEnvironment = (
  rpcUrls?: string[],
  indexerUrl?: string,
  governanceIndexerUrl?: string,
): Environment<typeof tokens, typeof contracts, typeof custom, {}, {}> =>
  createEnvironmentConfig({
    key: "ethereum",
    name: "Ethereum",
    chain: {
      ...ethereum,
      rpcUrls: {
        default: { http: rpcUrls || ["https://rpc.moonwell.fi/main/evm/1"] },
      },
    },
    transport: rpcUrls
      ? fallback(rpcUrls.map((url) => http(url)))
      : http("https://rpc.moonwell.fi/main/evm/1"),
    indexerUrl: indexerUrl || "https://ponder.moonwell.fi",
    governanceIndexerUrl:
      governanceIndexerUrl ||
      "https://lunar-services-worker.moonwell.workers.dev",
    tokens,
    markets: {},
    vaults: {},
    morphoMarkets: {},
    contracts,
    custom,
  }) as Environment<typeof tokens, typeof contracts, typeof custom, {}, {}>;

export { createEnvironment, ethereum, tokens };
