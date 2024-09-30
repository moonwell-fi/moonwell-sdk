import { http, fallback } from "viem";
import { optimism } from "viem/chains";
import { createEnvironmentConfig } from "../../types/config.js";
import { contracts } from "./contracts.js";
import { markets } from "./core-markets.js";
import { custom } from "./custom.js";
import { tokens } from "./tokens.js";
const createEnvironment = (rpcUrls, indexerUrl) => createEnvironmentConfig({
    name: "Optimism",
    chain: optimism,
    transport: rpcUrls
        ? fallback(rpcUrls.map((url) => http(url)))
        : http(optimism.rpcUrls.default.http[0]),
    indexerUrl: indexerUrl || "https//ponder.moonwell.fi",
    tokens,
    markets,
    vaults: {},
    morphoMarkets: {},
    contracts,
    custom,
});
export { createEnvironment, markets, tokens };
//# sourceMappingURL=environment.js.map