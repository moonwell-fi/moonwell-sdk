import { http, fallback } from "viem";
import { moonbeam } from "viem/chains";
import { createEnvironmentConfig } from "../../types/config.js";
import { contracts } from "./contracts.js";
import { markets } from "./core-markets.js";
import { custom } from "./custom.js";
import { tokens } from "./tokens.js";
const createEnvironment = (rpcUrls, indexerUrl) => createEnvironmentConfig({
    name: "Moonbeam",
    chain: moonbeam,
    transport: rpcUrls
        ? fallback(rpcUrls.map((url) => http(url)))
        : http(moonbeam.rpcUrls.default.http[0]),
    indexerUrl: indexerUrl || "https://ponder.moonwell.fi",
    tokens,
    markets,
    vaults: {},
    morphoMarkets: {},
    contracts,
    custom,
});
export { moonbeam, createEnvironment, markets, tokens };
//# sourceMappingURL=environment.js.map