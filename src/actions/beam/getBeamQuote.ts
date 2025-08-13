import type { GetFusionQuotePayload } from "@biconomy/abstractjs";
import type { Address, WalletClient } from "viem";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import type { HttpRequestError } from "../../common/index.js";
import type { OptionalNetworkParameterType } from "../../common/types.js";
import type { Chain } from "../../environments/index.js";
import type { BeamTokenInfo } from "../../types/beam.js";
import { getQuote } from "./common.js";

export type BeamQuote =
  | {
      status: "success";
      checks: {
        approvals: {
          spender: `0x${string}`;
          tokenAddress: `0x${string}`;
          chainId: number;
          amount: bigint;
        }[];
        transfers: {
          to: `0x${string}`;
          chainId: number;
          amount: bigint;
        }[];
      };
      estimatedCompletionTimesec: number;
      deadline: number;
      meeFee: string;
      outputAmounts: {
        tokenAddress: `0x${string}`;
        chainId: number;
        amount: bigint;
      }[];
      rawQuote: GetFusionQuotePayload;
      execute: () => Promise<{
        hash: `0x${string}`;
        wait: (confirmations: number) => Promise<void>;
        status: () => Promise<
          "pending" | "processing" | "success" | "reverted"
        >;
      }>;
    }
  | {
      status: "error";
      error: string;
    };

export type GetBeamQuoteErrorType = HttpRequestError;

export type GetBeamQuoteReturnType = Promise<BeamQuote>;

export type BeamQuoteArgs =
  | {
      type: "supply" | "vault-deposit";
      sources: (BeamTokenInfo & { amount: bigint })[];
      destination: BeamTokenInfo;
    }
  | {
      type: "morpho-supply";
      sources: (BeamTokenInfo & { amount: bigint })[];
      destination: BeamTokenInfo & {
        morphoBlue: Address;
        marketParams: {
          loanToken: Address;
          collateralToken: Address;
          irm: Address;
          lltv: bigint;
          oracle: Address;
        };
      };
    }
  | {
      type: "withdraw";
      market: string;
      destinations: (BeamTokenInfo & { amount: bigint })[];
    };

export type GetBeamQuoteParameters<
  environments,
  network extends Chain | undefined,
> = OptionalNetworkParameterType<environments, network> & {
  wallet: WalletClient;
} & BeamQuoteArgs;

/**
 * Returns a list of the tokens that can have unified balances
 */
export async function getBeamQuote<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetBeamQuoteParameters<environments, Network>,
): GetBeamQuoteReturnType {
  const quote = await getQuote(client, args);
  return quote;
}
