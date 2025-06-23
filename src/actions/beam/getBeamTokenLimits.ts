import axios from "axios";
import type { HttpRequestError } from "../../common/index.js";
import { Amount } from "../../common/index.js";
import type { BeamTokenLimits, BeamTokenRoutes } from "../../types/beam.js";

export type GetBeamTokenLimitsErrorType = HttpRequestError;

export type GetBeamTokenLimitsReturnType = Promise<BeamTokenLimits[]>;

export type GetBeamTokenLimitsArgs = {
  route: BeamTokenRoutes;
  direction: "deposit" | "withdraw";
};
/**
 * Returns a list of the tokens that can have unified balances
 */
export async function getBeamTokenLimits(
  args: GetBeamTokenLimitsArgs,
): GetBeamTokenLimitsReturnType {
  const { direction, route } = args;

  const limits: BeamTokenLimits[] = [];

  for (const path of args.route.routes) {
    const inputToken =
      direction === "withdraw"
        ? route.routeTokenAddress
        : path.routeTokenAddress;
    const outputToken =
      direction === "withdraw"
        ? path.routeTokenAddress
        : route.routeTokenAddress;
    const inputChainId =
      direction === "withdraw" ? route.chainId : path.chainId;
    const outputChainId =
      direction === "withdraw" ? path.chainId : route.chainId;

    try {
      const acrossLimitsResponse = await axios.get<{
        minDeposit: string;
        maxDeposit: string;
        maxDepositInstant: string;
        maxDepositShortDelay: string;
        recommendedDepositInstant: string;
      }>(
        `https://app.across.to/api/limits?inputToken=${inputToken}&outputToken=${outputToken}&originChainId=${inputChainId}&destinationChainId=${outputChainId}`,
      );

      limits.push({
        from: {
          address: direction === "withdraw" ? route.address : path.address,
          chainId: direction === "withdraw" ? route.chainId : path.chainId,
          decimals: direction === "withdraw" ? route.decimals : path.decimals,
          name: direction === "withdraw" ? route.name : path.name,
          routeTokenAddress:
            direction === "withdraw"
              ? route.routeTokenAddress
              : path.routeTokenAddress,
          symbol: direction === "withdraw" ? route.symbol : path.symbol,
        },
        to: {
          address: direction === "withdraw" ? path.address : route.address,
          chainId: direction === "withdraw" ? path.chainId : route.chainId,
          decimals: direction === "withdraw" ? path.decimals : route.decimals,
          name: direction === "withdraw" ? path.name : route.name,
          routeTokenAddress:
            direction === "withdraw"
              ? path.routeTokenAddress
              : route.routeTokenAddress,
          symbol: direction === "withdraw" ? path.symbol : route.symbol,
        },
        max: new Amount(
          BigInt(acrossLimitsResponse.data.maxDepositInstant),
          route.decimals,
        ),
        min: new Amount(
          BigInt(acrossLimitsResponse.data.minDeposit),
          route.decimals,
        ),
      });
    } catch (ex) {
      console.log({
        error: ex,
      });
    }
  }

  return limits;
}
