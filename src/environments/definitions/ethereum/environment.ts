import { http, defineChain, fallback } from "viem";
import { mainnet } from "viem/chains";
import {
  type Environment,
  createEnvironmentConfig,
} from "../../types/config.js";
import { contracts } from "./contracts.js";
import { custom } from "./custom.js";
import { tokens } from "./tokens.js";

// viem's `mainnet` chain leaves `testnet` undefined; consumers
// (e.g. the bridge modal) check `env.chain.testnet === false` strictly.
const ethereum = defineChain({ ...mainnet, testnet: false });

const createEnvironment = (
  rpcUrls?: string[],
  governanceIndexerUrl?: string,
): Environment<typeof tokens, {}, {}, typeof contracts, typeof custom> =>
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
    governanceIndexerUrl:
      governanceIndexerUrl ||
      "https://lunar-services-worker.moonwell.workers.dev",
    tokens,
    markets: {},
    vaults: {},
    morphoMarkets: {},
    contracts,
    custom,
  }) as Environment<typeof tokens, {}, {}, typeof contracts, typeof custom>;

export { createEnvironment, ethereum, tokens };
