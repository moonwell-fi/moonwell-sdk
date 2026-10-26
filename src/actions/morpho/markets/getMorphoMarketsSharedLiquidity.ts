import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentFromArgs } from "../../../common/index.js";
import type { NetworkParameterType } from "../../../common/types.js";
import type { Chain } from "../../../environments/index.js";
import type {
  MorphoMarket,
  MorphoMarketSharedLiquidity,
} from "../../../types/morphoMarket.js";
import {
  computeSharedLiquidityFromLunar,
  fetchSharedLiquidityFromLunar,
} from "./common.js";

export type GetMorphoMarketsSharedLiquidityParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> & {
  /** Pass the full chain's base market result to retain allocation parameters. */
  markets: readonly MorphoMarket[];
  signal?: AbortSignal;
  /** Overall deadline, including retries and backoff. Defaults to 15 seconds. */
  timeoutMs?: number;
};

export type GetMorphoMarketsSharedLiquidityReturnType = Promise<
  MorphoMarketSharedLiquidity[]
>;

/** Fetch allocator liquidity independently, without refetching base market data.
 * Rejects on failure so callers can retain the previous successful snapshot and
 * distinguish unavailable liquidity from a successful empty allocation list. */
export async function getMorphoMarketsSharedLiquidity<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMorphoMarketsSharedLiquidityParameters<environments, Network>,
): GetMorphoMarketsSharedLiquidityReturnType {
  const environment = getEnvironmentFromArgs(client, args);
  if (!environment?.lunarIndexerUrl) {
    throw new Error(
      "Independent shared liquidity requires a configured Lunar Indexer environment",
    );
  }
  if (args.markets.some((market) => market.chainId !== environment.chainId)) {
    throw new Error(
      "Shared-liquidity markets must belong to the requested chain",
    );
  }
  if (args.markets.length === 0) return [];

  const marketParamsMap = new Map(
    args.markets.map((market) => [
      market.marketId.toLowerCase(),
      {
        oracle: market.marketParams.oracle,
        irm: market.marketParams.irm,
        lltv: market.marketParams.lltv.toString(),
        // Display token metadata can use the native-token zero address for ETH.
        // Allocator transactions need the actual ERC20 addresses from Morpho.
        loanToken: {
          address: market.marketParams.loanToken,
          decimals: market.loanToken.decimals,
        },
        collateralToken: {
          address: market.marketParams.collateralToken,
          decimals: market.collateralToken.decimals,
        },
      },
    ]),
  );
  try {
    const data = await fetchSharedLiquidityFromLunar(
      environment.lunarIndexerUrl,
      environment.chainId,
      args,
    );
    return computeSharedLiquidityFromLunar(
      data,
      args.markets.map((market) => market.marketId),
      marketParamsMap,
      environment.chainId,
    );
  } catch (error) {
    if (!args.signal?.aborted) {
      environment.onError?.(error, {
        source: "morpho-shared-liquidity",
        chainId: environment.chainId,
      });
    }
    throw error;
  }
}
