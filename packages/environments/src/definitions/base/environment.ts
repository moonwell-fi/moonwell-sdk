import { http, type Transport, defineChain } from "viem";
import { base as baseChain } from "viem/chains";
import { type Environment, createEnvironmentConfig } from "../../types/config.js";
import { contracts } from "./contracts.js";
import { markets } from "./core-markets.js";
import { custom } from "./custom.js";
import { morphoMarkets } from "./morpho-markets.js";
import { vaults } from "./morpho-vaults.js";
import { tokens } from "./tokens.js";

const base = defineChain({ ...baseChain, testnet: false });

const createEnvironment = (
  transport?: Transport,
  indexerUrl?: string,
): Environment<typeof tokens, typeof markets, typeof vaults, typeof contracts, typeof custom> =>
  createEnvironmentConfig({
    name: "Base",
    chain: base,
    transport: transport || http(base.rpcUrls.default.http[0]),
    indexerUrl: indexerUrl || "https//ponder.moonwell.fi",
    tokens,
    markets,
    vaults,
    morphoMarkets,
    contracts,
    custom,
  }) as Environment<typeof tokens, typeof markets, typeof vaults, typeof contracts, typeof custom>;

export { base, createEnvironment, markets, morphoMarkets, vaults, tokens };
