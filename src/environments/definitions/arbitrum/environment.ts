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
): Environment<typeof tokens, {}, {}, {}, {}> =>
  createEnvironmentConfig({
    key: "arbitrum",
    name: "Arbitrum",
    chain: arbitrum,
    transport: rpcUrls
      ? fallback(rpcUrls.map((url) => http(url)))
      : http(arbitrum.rpcUrls.default.http[0]),
    indexerUrl: indexerUrl || "https://ponder.moonwell.fi",
    tokens,
    markets: {},
    vaults: {},
    morphoMarkets: {},
    contracts: {},
    custom: {},
  }) as Environment<typeof tokens, {}, {}, {}, {}>;

export { arbitrum, createEnvironment, tokens };
