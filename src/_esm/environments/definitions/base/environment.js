import { http, defineChain, fallback } from "viem";
import { base as baseChain } from "viem/chains";
import { createEnvironmentConfig, } from "../../types/config.js";
import { contracts } from "./contracts.js";
import { markets } from "./core-markets.js";
import { custom } from "./custom.js";
import { morphoMarkets } from "./morpho-markets.js";
import { vaults } from "./morpho-vaults.js";
import { tokens } from "./tokens.js";
const base = defineChain({ ...baseChain, testnet: false });
const createEnvironment = (rpcUrls, indexerUrl) => createEnvironmentConfig({
    name: "Base",
    chain: base,
    transport: rpcUrls
        ? fallback(rpcUrls.map((url) => http(url)))
        : http(base.rpcUrls.default.http[0]),
    indexerUrl: indexerUrl || "https//ponder.moonwell.fi",
    tokens,
    markets,
    vaults,
    morphoMarkets,
    contracts,
    custom,
});
export { base, createEnvironment, markets, morphoMarkets, vaults, tokens };
//# sourceMappingURL=environment.js.map