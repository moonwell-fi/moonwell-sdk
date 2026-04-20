import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import {
  type SnapshotPeriod,
  applyGranularity,
  calculateTimeRange,
  getEnvironmentFromArgs,
  isStartOfDay,
  toApiGranularity,
} from "../../../common/index.js";
import { buildMarketId } from "../../../common/lunar-indexer-helpers.js";
import type { NetworkParameterType } from "../../../common/types.js";
import type { Chain, Environment } from "../../../environments/index.js";
import type { MarketSnapshot } from "../../../types/market.js";
import {
  DEFAULT_LUNAR_TIMEOUT_MS,
  createLunarIndexerClient,
} from "../../lunar-indexer-client.js";
import { transformMarketSnapshots } from "../../lunar-indexer-transformers.js";
import {
  fetchMarketSnapshotsFromIndexer,
  transformIsolatedMarketSnapshotFromIndexer,
} from "../../morpho/markets/lunarIndexerTransform.js";

export type GetMarketSnapshotsParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> & {
  type: "core" | "isolated";
  marketId: `0x${string}`;
  /** Predefined time period for snapshots */
  period?: SnapshotPeriod;
  startTime?: number;
  endTime?: number;
};

export type GetMarketSnapshotsReturnType = Promise<MarketSnapshot[]>;

/**
 * Remove snapshots from before the market's first recorded activity.
 * Exported for testing.
 * When a requested time range predates the market's deployment, the indexer
 * returns zero-value records for those early dates. This trims everything
 * before the earliest snapshot that has any supply or borrow activity.
 */
export function trimLeadingEmptySnapshots(
  snapshots: MarketSnapshot[],
): MarketSnapshot[] {
  let firstActiveTimestamp = Number.POSITIVE_INFINITY;
  for (const s of snapshots) {
    if (
      (s.totalSupply > 0 || s.totalBorrows > 0) &&
      s.timestamp < firstActiveTimestamp
    ) {
      firstActiveTimestamp = s.timestamp;
    }
  }
  if (firstActiveTimestamp === Number.POSITIVE_INFINITY) return [];
  return snapshots.filter((s) => s.timestamp >= firstActiveTimestamp);
}

export async function getMarketSnapshots<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMarketSnapshotsParameters<environments, Network>,
): GetMarketSnapshotsReturnType {
  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return [];
  }

  if (args?.type === "core") {
    const snapshots = await fetchCoreMarketSnapshots(
      args.marketId,
      environment,
      args.period,
      args.startTime,
      args.endTime,
    );
    return trimLeadingEmptySnapshots(snapshots);
  }

  const snapshots = await fetchIsolatedMarketSnapshots(
    args.marketId,
    environment,
    args.period,
    args.startTime,
    args.endTime,
  );

  // Apply a final sanity check to ensure totalSupply is always in loan token units.
  //
  // Some markets (e.g. USDC/ETH where collateral=USDC, loan=WETH) normalize
  // totalSupply to collateral units — skip the check for those because
  // loanTokenPrice (~$2000) vs implied price (~$1) would incorrectly trigger.
  const marketConfig = Object.values(environment.config.morphoMarkets).find(
    (m) => m.id.toLowerCase() === args.marketId.toLowerCase(),
  );
  const loanSymbol = marketConfig
    ? environment.config.tokens[marketConfig.loanToken]?.symbol
    : undefined;
  const collateralSymbol = marketConfig
    ? environment.config.tokens[marketConfig.collateralToken]?.symbol
    : undefined;
  // Markets where totalSupply is already in collateral units after the inner
  // conversion — skip the outer USDC-unit sanity check for these.
  // • USDC/ETH: normalizeToCollateral flips supply to USDC units (collateral)
  // • stkWELL/USDC: isStkWellMarket block converts USDC supply → stkWELL units
  const isNormalizedMarket =
    (loanSymbol === "ETH" && collateralSymbol === "USDC") ||
    collateralSymbol === "stkWELL";

  const result = isNormalizedMarket
    ? snapshots
    : snapshots.map((snapshot) => {
        if (snapshot.totalSupply === 0 || snapshot.loanTokenPrice === 0)
          return snapshot;
        const impliedLoanPrice = snapshot.totalSupplyUsd / snapshot.totalSupply;
        if (impliedLoanPrice < snapshot.loanTokenPrice * 0.1) {
          return {
            ...snapshot,
            totalSupply: snapshot.totalSupplyUsd / snapshot.loanTokenPrice,
            totalLiquidity:
              snapshot.totalLiquidityUsd / snapshot.loanTokenPrice,
          };
        }
        return snapshot;
      });

  return trimLeadingEmptySnapshots(result);
}

async function fetchCoreMarketSnapshots(
  marketAddress: string,
  environment: Environment,
  period?: "1M" | "3M" | "1Y" | "ALL",
  startTime?: number,
  endTime?: number,
): Promise<MarketSnapshot[]> {
  if (!environment.lunarIndexerUrl) {
    return [];
  }
  try {
    return await fetchCoreMarketSnapshotsFromLunar(
      marketAddress,
      environment,
      period,
      startTime,
      endTime,
    );
  } catch (error) {
    console.warn(
      `[getMarketSnapshots] Lunar Indexer failed for chain ${environment.chainId}:`,
      error,
    );
    environment.onError?.(error, {
      source: "market-snapshots",
      chainId: environment.chainId,
    });
    return [];
  }
}

async function fetchCoreMarketSnapshotsFromLunar(
  marketAddress: string,
  environment: Environment,
  period?: "1M" | "3M" | "1Y" | "ALL",
  customStartTime?: number,
  customEndTime?: number,
): Promise<MarketSnapshot[]> {
  if (!environment.lunarIndexerUrl) {
    throw new Error("Lunar Indexer URL not configured");
  }

  const client = createLunarIndexerClient({
    baseUrl: environment.lunarIndexerUrl,
    timeout: DEFAULT_LUNAR_TIMEOUT_MS,
  });

  const marketId = buildMarketId(environment.chainId, marketAddress);
  const { startTime, endTime, granularity } = calculateTimeRange(
    period,
    customStartTime,
    customEndTime,
  );

  const allSnapshots: MarketSnapshot[] = [];
  let cursor: string | null = null;
  const MAX_PAGES = 100;
  let page = 0;

  do {
    const response = await client.getMarketSnapshots(marketId, {
      limit: 1000,
      ...(cursor && { cursor }),
      granularity: toApiGranularity(granularity),
      startTime,
      endTime,
    });

    const transformed = transformMarketSnapshots(
      response.results,
      environment.chainId,
    );

    allSnapshots.push(...transformed);

    cursor = response.nextCursor;
    page++;
  } while (cursor !== null && page < MAX_PAGES);

  allSnapshots.sort((a, b) => a.timestamp - b.timestamp);
  return applyGranularity(allSnapshots, granularity).map((snapshot) => {
    const supplied = snapshot.totalSupply;
    const suppliedUsd = snapshot.totalSupplyUsd;
    const price = supplied > 0 ? suppliedUsd / supplied : 0;

    return {
      ...snapshot,
      collateralTokenPrice: price,
      loanTokenPrice: price,
    };
  });
}

// Fetches a timestamp-ms → WELL price map from the WELL market in the indexer.
// Used to correct stkWELL snapshots where the indexer stored collateralTokenPrice = 0.
async function fetchWellPricesByTimestamp(
  lunarIndexerUrl: string,
  chainId: number,
  wellMarketConfig: { id: string; collateralToken: string; loanToken: string },
  startTime: number,
): Promise<Map<number, number>> {
  const wellIsCollateral = wellMarketConfig.collateralToken === "WELL";
  const priceMap = new Map<number, number>();
  let cursor: string | undefined;
  const MAX_PAGES = 100;
  let page = 0;

  do {
    const response = await fetchMarketSnapshotsFromIndexer(
      lunarIndexerUrl,
      chainId,
      wellMarketConfig.id,
      {
        startTime,
        granularity: "1d",
        limit: 1000,
        ...(cursor && { cursor }),
      },
    );

    for (const snapshot of response.results) {
      const price = Number.parseFloat(
        wellIsCollateral
          ? snapshot.collateralTokenPrice
          : snapshot.loanTokenPrice,
      );
      if (price > 0) {
        priceMap.set(snapshot.timestamp * 1000, price);
      }
    }

    cursor = response.nextCursor ?? undefined;
    page++;
  } while (cursor !== undefined && page < MAX_PAGES);

  return priceMap;
}

export async function fetchIsolatedMarketSnapshots(
  marketAddress: string,
  environment: Environment,
  period?: "1M" | "3M" | "1Y" | "ALL",
  customStartTime?: number,
  customEndTime?: number,
): Promise<MarketSnapshot[]> {
  const lunarIndexerUrl = environment.lunarIndexerUrl;

  if (!lunarIndexerUrl) {
    return [];
  }

  try {
    return await fetchIsolatedMarketSnapshotsFromLunar(
      marketAddress,
      environment,
      lunarIndexerUrl,
      period,
      customStartTime,
      customEndTime,
    );
  } catch (error) {
    console.warn(
      `[getMarketSnapshots] Lunar Indexer failed for chain ${environment.chainId}:`,
      error,
    );
    environment.onError?.(error, {
      source: "market-snapshots",
      chainId: environment.chainId,
    });
    return [];
  }
}

async function fetchIsolatedMarketSnapshotsFromLunar(
  marketAddress: string,
  environment: Environment,
  lunarIndexerUrl: string,
  period?: "1M" | "3M" | "1Y" | "ALL",
  customStartTime?: number,
  customEndTime?: number,
): Promise<MarketSnapshot[]> {
  const { startTime } = calculateTimeRange(
    period,
    customStartTime,
    customEndTime,
  );

  // The USDC/ETH market (collateral = USDC, loan = WETH) needs normalization:
  // the indexer returns totalSupplyAssets in WETH units but the chart needs
  // USDC-equivalent units (totalSupplyAssetsUsd / collateralTokenPrice).
  const marketConfig = Object.values(environment.config.morphoMarkets).find(
    (m) => m.id.toLowerCase() === marketAddress.toLowerCase(),
  );
  const loanSymbol = marketConfig
    ? environment.config.tokens[marketConfig.loanToken]?.symbol
    : undefined;
  const collateralSymbol = marketConfig
    ? environment.config.tokens[marketConfig.collateralToken]?.symbol
    : undefined;
  const normalizeToCollateral =
    loanSymbol === "ETH" && collateralSymbol === "USDC";

  // stkWELL is not priced by the indexer (same oracle as WELL but unrecognized).
  // Fetch the WELL market snapshots concurrently and use their prices to correct
  // any stkWELL snapshots where collateralTokenPrice is 0.
  const isStkWellMarket = collateralSymbol === "stkWELL";
  const wellMarketConfig = isStkWellMarket
    ? Object.values(environment.config.morphoMarkets).find(
        (m) => m.collateralToken === "WELL" || m.loanToken === "WELL",
      )
    : undefined;

  const wellPricesPromise = wellMarketConfig
    ? fetchWellPricesByTimestamp(
        lunarIndexerUrl,
        environment.chainId,
        wellMarketConfig,
        startTime,
      )
    : Promise.resolve(new Map<number, number>());

  const allSnapshots: MarketSnapshot[] = [];
  let cursor: string | undefined;
  const MAX_PAGES = 100;
  let page = 0;

  do {
    const response = await fetchMarketSnapshotsFromIndexer(
      lunarIndexerUrl,
      environment.chainId,
      marketAddress,
      {
        startTime,
        granularity: "1d",
        limit: 1000,
        ...(cursor && { cursor }),
      },
    );

    allSnapshots.push(
      ...response.results
        .filter((s) => isStartOfDay(s.timestamp))
        .map((s) =>
          transformIsolatedMarketSnapshotFromIndexer(s, {
            normalizeToCollateral,
          }),
        ),
    );

    cursor = response.nextCursor ?? undefined;
    page++;
  } while (cursor !== undefined && page < MAX_PAGES);

  // Sanity check for non-normalized markets: detect when totalSupplyAssets was
  // stored in collateral units instead of loan token units (an indexer bug seen on
  // the stkWELL/USDC market). When this happens, totalSupplyUsd / totalSupply is
  // close to collateralTokenPrice rather than loanTokenPrice. Recover the correct
  // loan-token amount from the USD value instead of discarding the data point.
  // We skip normalized markets (e.g. USDC/ETH where totalSupply is already in
  // collateral units after normalization) to avoid false corrections.
  const sanitizedSnapshots = normalizeToCollateral
    ? allSnapshots
    : allSnapshots.map((snapshot) => {
        if (snapshot.totalSupply === 0 || snapshot.loanTokenPrice === 0)
          return snapshot;
        const impliedLoanPrice = snapshot.totalSupplyUsd / snapshot.totalSupply;
        if (impliedLoanPrice < snapshot.loanTokenPrice * 0.1) {
          return {
            ...snapshot,
            totalSupply: snapshot.totalSupplyUsd / snapshot.loanTokenPrice,
            totalLiquidity:
              snapshot.totalLiquidityUsd / snapshot.loanTokenPrice,
          };
        }
        return snapshot;
      });

  if (isStkWellMarket) {
    const wellPriceByTimestampMs = await wellPricesPromise;
    return sanitizedSnapshots.map((snapshot) => {
      // Resolve the collateral (stkWELL) price: use indexed price when available,
      // fall back to the WELL market price fetched concurrently.
      let collateralTokenPrice = snapshot.collateralTokenPrice;
      if (collateralTokenPrice === 0) {
        const wellPrice = wellPriceByTimestampMs.get(snapshot.timestamp);
        if (wellPrice) collateralTokenPrice = wellPrice;
      }

      // The lunar indexer stores totalSupplyAssets in loan-token (USDC) units.
      // Convert to collateral (stkWELL) units for a consistent chart axis:
      //   totalSupply = totalSupplyUsd / collateralTokenPrice
      const totalSupply =
        collateralTokenPrice > 0
          ? snapshot.totalSupplyUsd / collateralTokenPrice
          : snapshot.totalSupply;
      const totalLiquidity =
        collateralTokenPrice > 0
          ? snapshot.totalLiquidityUsd / collateralTokenPrice
          : snapshot.totalLiquidity;
      const totalReallocatableLiquidity =
        collateralTokenPrice > 0
          ? snapshot.totalReallocatableLiquidityUsd / collateralTokenPrice
          : snapshot.totalReallocatableLiquidity;

      return {
        ...snapshot,
        collateralTokenPrice,
        totalSupply,
        totalLiquidity,
        totalReallocatableLiquidity,
      };
    });
  }

  return sanitizedSnapshots;
}
