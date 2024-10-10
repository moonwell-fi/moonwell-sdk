import type { Address } from "viem";
import type {
  GetEnvironment,
  MarketsType,
  MorphoMarketsType,
  VaultsType,
} from "../environments/index.js";

export type MultichainReturnType<T> = { [chainId: number]: T };

export type NetworkParameterType<environments, network> =
  undefined extends network
    ? {
        /** Chain ID */
        chainId: number;
      }
    : {
        /** Network key */
        network: keyof environments;
      };

export type OptionalNetworkParameterType<environments, network> =
  undefined extends network
    ? {
        /** Chain ID */
        chainId?: number;
      }
    : {
        /** Network key */
        network?: keyof environments;
      };

export type MarketParameterType<network> = undefined extends network
  ? {
      /** Address of the market token */
      marketAddress: Address;
    }
  : {
      /** Market key */
      market: keyof MarketsType<GetEnvironment<network>>;
    };

export type MorphoMarketParameterType<network> = undefined extends network
  ? {
      /** Unique Id of the market */
      marketId: Address;
    }
  : {
      /** Market key */
      market: keyof MorphoMarketsType<GetEnvironment<network>>;
    };

export type MorphoVaultParameterType<network> = undefined extends network
  ? {
      /** Address of the vault token */
      vaultAddress: Address;
    }
  : {
      /** Vault key */
      vault: keyof VaultsType<GetEnvironment<network>>;
    };
