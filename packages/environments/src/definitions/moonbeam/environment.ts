import { http, type Transport } from "viem";
import { moonbeam } from "viem/chains";
import { createEnvironmentConfig } from "../../types/config.js";
import { contracts } from "./contracts.js";
import { markets } from "./core-markets.js";
import { custom } from "./custom.js";
import { tokens } from "./tokens.js";

const createEnvironment = (transport?: Transport, indexerUrl?: string) =>
  createEnvironmentConfig({
    name: "Moonbeam",
    chain: moonbeam,
    transport: transport || http(moonbeam.rpcUrls.default.http[0]),
    indexerUrl: indexerUrl || "https//ponder.moonwell.fi",
    tokens,
    markets,
    vaults: {},
    morphoMarkets: {},
    contracts,
    custom,
  });

export { moonbeam, createEnvironment, markets, tokens };
