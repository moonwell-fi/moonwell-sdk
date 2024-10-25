import { http, defineChain, fallback } from "viem";
import { optimism as optimismChain } from "viem/chains";
import { createEnvironmentConfig } from "../../types/config.js";
import { contracts } from "./contracts.js";
import { markets } from "./core-markets.js";
import { custom } from "./custom.js";
import { tokens } from "./tokens.js";

const optimism = defineChain({ ...optimismChain, testnet: false });

const createEnvironment = (rpcUrls?: string[], indexerUrl?: string) =>
  createEnvironmentConfig({
    key: "optimism",
    name: "Optimism",
    chain: optimism,
    transport: rpcUrls
      ? fallback(rpcUrls.map((url) => http(url)))
      : http(optimism.rpcUrls.default.http[0]),
    indexerUrl: indexerUrl || "https://ponder.moonwell.fi",
    tokens,
    markets,
    vaults: {},
    morphoMarkets: {},
    contracts,
    custom,
  });

export { createEnvironment, markets, tokens };
