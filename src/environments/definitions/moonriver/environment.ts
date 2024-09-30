import { http, fallback } from "viem";
import { moonriver } from "viem/chains";
import { createEnvironmentConfig } from "../../types/config.js";
import { contracts } from "./contracts.js";
import { markets } from "./core-markets.js";
import { custom } from "./custom.js";
import { tokens } from "./tokens.js";

const createEnvironment = (rpcUrls?: string[], indexerUrl?: string) =>
  createEnvironmentConfig({
    name: "Moonriver",
    chain: moonriver,
    transport: rpcUrls
      ? fallback(rpcUrls.map((url) => http(url)))
      : http(moonriver.rpcUrls.default.http[0]),
    indexerUrl: indexerUrl || "https//ponder.moonwell.fi",
    tokens,
    markets,
    vaults: {},
    morphoMarkets: {},
    contracts,
    custom,
  });

export { createEnvironment, markets, tokens };
