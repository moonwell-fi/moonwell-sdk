import type { Narrow, Prettify } from "viem";
import {
  type ArbitrumEnvironment,
  type AvalancheEnvironment,
  type BaseEnvironment,
  type Environment,
  type EthereumEnvironment,
  type OnErrorContext,
  type OptimismEnvironment,
  type PolygonEnvironment,
  type SupportedChains,
  arbitrum,
  avalanche,
  base,
  createEnvironment,
  ethereum,
  optimism,
  polygon,
  supportedChains,
} from "../environments/index.js";
import { actions } from "./createActions.js";

export type MoonwellClient<
  environments = { [name in SupportedChains]?: Environment },
> = {
  environments: Prettify<
    {
      [name in keyof environments as Extract<name, "base">]: BaseEnvironment;
    } & {
      [name in keyof environments as Extract<
        name,
        "optimism"
      >]: OptimismEnvironment;
    } & {
      [name in keyof environments as Extract<
        name,
        "ethereum"
      >]: EthereumEnvironment;
    } & {
      [name in keyof environments as Extract<
        name,
        "avalanche"
      >]: AvalancheEnvironment;
    } & {
      [name in keyof environments as Extract<
        name,
        "arbitrum"
      >]: ArbitrumEnvironment;
    } & {
      [name in keyof environments as Extract<
        name,
        "polygon"
      >]: PolygonEnvironment;
    }
  >;
};

export type NetworkConfig = {
  rpcUrls: string[];
};

export type NetworksConfig<networks> = {} extends networks
  ? {}
  : { [name in SupportedChains]?: NetworkConfig };

export const createMoonwellClient = <const networks>(config: {
  networks: NetworksConfig<Narrow<networks>>;
  onError?: (error: unknown, context: OnErrorContext) => void;
}) => {
  const environments = Object.entries(
    config.networks as NetworksConfig<SupportedChains>,
  ).reduce((prev, [curr, networkConfig]) => {
    if (!networkConfig) return prev;

    // Every supported key gets its own branch and unknown keys throw. The old
    // shape ended in a bare `: polygon` fallthrough, so a key TypeScript would
    // have rejected — `moonbeam`/`moonriver` after the sunset (MOO-551), or any
    // typo from a JS consumer — silently built a *Polygon* environment stored
    // under that key, wired with Polygon addresses over the caller's RPC. Fail
    // loudly instead, matching `createEnvironment`'s "Unsupported chainId".
    const chain =
      curr === "base"
        ? base
        : curr === "optimism"
          ? optimism
          : curr === "ethereum"
            ? ethereum
            : curr === "avalanche"
              ? avalanche
              : curr === "arbitrum"
                ? arbitrum
                : curr === "polygon"
                  ? polygon
                  : undefined;

    if (!chain) {
      throw new Error(
        `Unsupported network "${curr}". Supported networks: ${Object.keys(
          supportedChains,
        ).join(", ")}.`,
      );
    }

    return {
      ...prev,
      [curr]: createEnvironment({
        chain,
        rpcUrls: networkConfig.rpcUrls,
      }),
    };
  }, {}) as Prettify<
    {
      [name in keyof networks as Extract<name, "base">]: BaseEnvironment;
    } & {
      [name in keyof networks as Extract<
        name,
        "optimism"
      >]: OptimismEnvironment;
    } & {
      [name in keyof networks as Extract<
        name,
        "ethereum"
      >]: EthereumEnvironment;
    } & {
      [name in keyof networks as Extract<
        name,
        "avalanche"
      >]: AvalancheEnvironment;
    } & {
      [name in keyof networks as Extract<
        name,
        "arbitrum"
      >]: ArbitrumEnvironment;
    } & {
      [name in keyof networks as Extract<name, "polygon">]: PolygonEnvironment;
    }
  >;

  if (config.onError) {
    const onError = config.onError;
    for (const env of Object.values(
      environments as Record<string, Environment>,
    )) {
      env.onError = onError;
    }
  }

  const client = {
    environments,
  };

  return Object.assign(client, actions<typeof environments>(client as any));
};
