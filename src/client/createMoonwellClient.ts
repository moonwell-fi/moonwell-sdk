import type { Chain, Narrow, Prettify } from "viem";
import {
  type BaseEnvironment,
  type Environment,
  type MoonbeamEnvironment,
  type MoonriverEnvironment,
  type OptimismEnvironment,
  type SupportedChains,
  createEnvironment,
} from "../environments/index.js";
import { createActions } from "./createActions.js";

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
    }
  >;
};

export type NetworkConfig = {
  chain: Chain;
  rpcUrls?: string[];
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
        chain: networkConfig.chain,
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
    }
  >;

  const client = {
    environments,
  };

  return Object.assign(
    client,
    createActions<typeof environments>(client as any),
  );
};
