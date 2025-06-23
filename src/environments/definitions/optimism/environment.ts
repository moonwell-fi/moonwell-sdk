import { http, defineChain, fallback } from "viem";
import { optimism as optimismChain } from "viem/chains";
import { createEnvironmentConfig } from "../../types/config.js";
import { contracts } from "./contracts.js";
import { markets } from "./core-markets.js";
import { custom } from "./custom.js";
import { morphoMarkets } from "./morpho-markets.js";
import { vaults } from "./morpho-vaults.js";
import { tokens } from "./tokens.js";
const optimism = defineChain({ ...optimismChain, testnet: false });

const createEnvironment = (
  rpcUrls?: string[],
  indexerUrl?: string,
  governanceIndexerUrl?: string,
) =>
  createEnvironmentConfig({
    key: "optimism",
    name: "OP Mainnet",
    chain: {
      ...optimism,
      rpcUrls: {
        default: { http: rpcUrls || optimism.rpcUrls.default.http },
      },
    },
    transport: rpcUrls
      ? fallback(rpcUrls.map((url) => http(url)))
      : http(optimism.rpcUrls.default.http[0]),
    indexerUrl: indexerUrl || "https://ponder.moonwell.fi",
    governanceIndexerUrl: governanceIndexerUrl || "https://ponder.moonwell.fi",
    tokens,
    markets,
    vaults,
    morphoMarkets,
    contracts,
    custom,
  });

export {
  createEnvironment,
  markets,
  tokens,
  vaults,
  morphoMarkets,
  contracts,
  custom,
};
