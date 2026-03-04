import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { Amount } from "../../../common/amount.js";
import { getEnvironmentFromArgs } from "../../../common/index.js";
import type {
  MorphoMarketParameterType,
  NetworkParameterType,
} from "../../../common/types.js";
import type { Chain } from "../../../environments/index.js";
import { fetchIsolatedMarketSnapshots } from "../../core/markets/getMarketSnapshots.js";
import { fetchMarketSnapshotsFromIndexer } from "./lunarIndexerTransform.js";

export type MarketSnapshot = {
  timestamp: number;
  blockNumber: bigint;
  totalSupplyAssets: Amount;
  totalBorrowAssets: Amount;
  totalLiquidity: Amount;
  totalSupplyAssetsUsd: number;
  totalBorrowAssetsUsd: number;
  totalLiquidityUsd: number;
  loanTokenPrice: number;
  collateralTokenPrice: number;
  supplyApy: number;
  borrowApy: number;
  lltv: number;
};

export type GetMarketSnapshotsParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> &
  MorphoMarketParameterType<network> & {
    startTime?: number;
    endTime?: number;
    limit?: number;
    cursor?: string;
    granularity?: "1h" | "6h" | "1d";
  };

export type GetMarketSnapshotsReturnType = Promise<{
  snapshots: MarketSnapshot[];
  nextCursor?: string;
}>;

export async function getMarketSnapshots<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetMarketSnapshotsParameters<environments, Network>,
): GetMarketSnapshotsReturnType {
  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    throw new Error("Environment not found");
  }

  // Resolve marketId and token config before the URL check so they're available
  // for both the indexer path and the fallback path.
  let { marketId, market } = args as unknown as {
    marketId: Address;
    market: string;
  };

  if (!marketId) {
    marketId = environment.config.morphoMarkets[market].id;
  }

  const marketConfig = Object.values(environment.config.morphoMarkets).find(
    (m) => m.id.toLowerCase() === marketId.toLowerCase(),
  );

  if (!marketConfig) {
    throw new Error(`Market ${marketId} not found in configuration`);
  }

  const loanToken = environment.config.tokens[marketConfig.loanToken];

  const lunarIndexerUrl = environment.lunarIndexerUrl;

  if (!lunarIndexerUrl) {
    // Fallback to Blue API → subgraph via the core fetchIsolatedMarketSnapshots.
    // blockNumber is not available from these paths; set to 0n as a sentinel value.
    const coreSnapshots = await fetchIsolatedMarketSnapshots(
      marketId,
      environment,
      undefined,
      args.startTime,
      args.endTime,
    );

    const snapshots: MarketSnapshot[] = coreSnapshots.map((s) => ({
      timestamp: s.timestamp,
      blockNumber: 0n,
      totalSupplyAssets: new Amount(
        BigInt(Math.round(s.totalSupply * 10 ** loanToken.decimals)),
        loanToken.decimals,
      ),
      totalBorrowAssets: new Amount(
        BigInt(Math.round(s.totalBorrows * 10 ** loanToken.decimals)),
        loanToken.decimals,
      ),
      totalLiquidity: new Amount(
        BigInt(Math.round(s.totalLiquidity * 10 ** loanToken.decimals)),
        loanToken.decimals,
      ),
      totalSupplyAssetsUsd: s.totalSupplyUsd,
      totalBorrowAssetsUsd: s.totalBorrowsUsd,
      totalLiquidityUsd: s.totalLiquidityUsd,
      loanTokenPrice: s.loanTokenPrice,
      collateralTokenPrice: s.collateralTokenPrice,
      supplyApy: s.baseSupplyApy,
      borrowApy: s.baseBorrowApy,
      lltv: 0,
    }));

    return { snapshots };
  }

  // Build options object with only defined values
  const options: {
    startTime?: number;
    endTime?: number;
    limit?: number;
    cursor?: string;
    granularity?: "1h" | "6h" | "1d";
  } = {};

  if (args.startTime !== undefined) {
    options.startTime = args.startTime;
  }
  if (args.endTime !== undefined) {
    options.endTime = args.endTime;
  }
  if (args.limit !== undefined) {
    options.limit = args.limit;
  }
  if (args.cursor !== undefined) {
    options.cursor = args.cursor;
  }
  if (args.granularity !== undefined) {
    options.granularity = args.granularity;
  }

  const response = await fetchMarketSnapshotsFromIndexer(
    lunarIndexerUrl,
    environment.chainId,
    marketId,
    options,
  );

  // Transform snapshots
  const snapshots: MarketSnapshot[] = response.results.map((snapshot) => {
    const totalSupplyAssets = new Amount(
      BigInt(
        Math.floor(
          Number.parseFloat(snapshot.totalSupplyAssets) *
            10 ** loanToken.decimals,
        ),
      ),
      loanToken.decimals,
    );

    const totalBorrowAssets = new Amount(
      BigInt(
        Math.floor(
          Number.parseFloat(snapshot.totalBorrowAssets) *
            10 ** loanToken.decimals,
        ),
      ),
      loanToken.decimals,
    );

    const totalLiquidity = new Amount(
      BigInt(
        Math.floor(
          Number.parseFloat(snapshot.totalLiquidity) * 10 ** loanToken.decimals,
        ),
      ),
      loanToken.decimals,
    );

    return {
      timestamp: snapshot.timestamp,
      blockNumber: BigInt(snapshot.blockNumber),
      totalSupplyAssets,
      totalBorrowAssets,
      totalLiquidity,
      totalSupplyAssetsUsd: Number.parseFloat(snapshot.totalSupplyAssetsUsd),
      totalBorrowAssetsUsd: Number.parseFloat(snapshot.totalBorrowAssetsUsd),
      totalLiquidityUsd: Number.parseFloat(snapshot.totalLiquidityUsd),
      loanTokenPrice: Number.parseFloat(snapshot.loanTokenPrice),
      collateralTokenPrice: Number.parseFloat(snapshot.collateralTokenPrice),
      supplyApy: Number.parseFloat(snapshot.supplyApy),
      borrowApy: Number.parseFloat(snapshot.borrowApy),
      lltv: Number.parseFloat(snapshot.lltv),
    };
  });

  const result: {
    snapshots: MarketSnapshot[];
    nextCursor?: string;
  } = {
    snapshots,
  };

  if (response.nextCursor !== undefined) {
    result.nextCursor = response.nextCursor;
  }

  return result;
}
