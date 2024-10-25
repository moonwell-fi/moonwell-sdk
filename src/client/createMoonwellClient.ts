import type { Narrow, Prettify } from "viem";
import {
  type ArbitrumEnvironment,
  type AvalancheEnvironment,
  type BaseEnvironment,
  type Environment,
  type EthereumEnvironment,
  type MoonbeamEnvironment,
  type MoonriverEnvironment,
  type OptimismEnvironment,
  type PolygonEnvironment,
  type SupportedChains,
  arbitrum,
  avalanche,
  base,
  createEnvironment,
  ethereum,
  moonbeam,
  moonriver,
  optimism,
  polygon,
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
        "moonbeam"
      >]: MoonbeamEnvironment;
    } & {
      [name in keyof environments as Extract<
        name,
        "moonriver"
      >]: MoonriverEnvironment;
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
}) => {
  const environments = Object.keys(config.networks).reduce((prev, curr) => {
    const key = curr as SupportedChains;
    const networkConfig = (config.networks as NetworksConfig<SupportedChains>)[
      key
    ]!;
    return {
      ...prev,
      [curr]: createEnvironment({
        chain:
          curr === "base"
            ? base
            : curr === "optimism"
              ? optimism
              : curr === "moonbeam"
                ? moonbeam
                : curr === "moonriver"
                  ? moonriver
                  : curr === "ethereum"
                    ? ethereum
                    : curr === "avalanche"
                      ? avalanche
                      : curr === "arbitrum"
                        ? arbitrum
                        : polygon,
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
        "moonbeam"
      >]: MoonbeamEnvironment;
    } & {
      [name in keyof networks as Extract<
        name,
        "moonriver"
      >]: MoonriverEnvironment;
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

  const client = {
    environments,
  };

  return Object.assign(client, actions<typeof environments>(client as any));
};
