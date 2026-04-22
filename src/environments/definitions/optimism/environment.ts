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
  governanceIndexerUrl?: string,
  lunarIndexerUrl?: string,
) =>
  createEnvironmentConfig({
    key: "optimism",
    name: "OP Mainnet",
    chain: {
      ...optimism,
      rpcUrls: {
        default: { http: rpcUrls || ["https://rpc.moonwell.fi/main/evm/10"] },
      },
    },
    transport: rpcUrls
      ? fallback(rpcUrls.map((url) => http(url)))
      : http("https://rpc.moonwell.fi/main/evm/10"),
    lunarIndexerUrl:
      lunarIndexerUrl || "https://lunar-services-worker.moonwell.workers.dev",
    governanceIndexerUrl:
      governanceIndexerUrl ||
      "https://lunar-services-worker.moonwell.workers.dev",
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
