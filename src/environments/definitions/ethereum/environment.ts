import { http, fallback } from "viem";
import { mainnet as ethereum } from "viem/chains";
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
    key: "ethereum",
    name: "Ethereum",
    chain: {
      ...ethereum,
      rpcUrls: {
        default: { http: rpcUrls || ethereum.rpcUrls.default.http },
      },
    },
    transport: rpcUrls
      ? fallback(rpcUrls.map((url) => http(url)))
      : http(ethereum.rpcUrls.default.http[0]),
    indexerUrl: indexerUrl || "https://ponder.moonwell.fi",
    governanceIndexerUrl: governanceIndexerUrl || "https://ponder.moonwell.fi",
    tokens,
    markets: {},
    vaults: {},
    morphoMarkets: {},
    contracts: {},
    custom: {},
  }) as Environment<typeof tokens, {}, {}, {}, {}>;

export { createEnvironment, ethereum, tokens };
