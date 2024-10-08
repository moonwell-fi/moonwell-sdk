import type { Address } from "viem";
import type { GetEnvironment, MarketsType } from "../environments/index.js";

export type MultichainReturnType<T> = { [chainId: number]: T };
export type NetworkParameterType<environments, network> =
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
