import type { Address } from "viem";
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import type { Chain, Environment } from "../../../environments/index.js";
import { fetchAccountMarketPortfolioFromIndexer } from "./lunarIndexerTransform.js";

export type AccountMarketPosition = {
  chainId: number;
  marketId: string;
  marketKey: string;
  supplyShares: string;
  borrowShares: string;
  collateral: string;
};

export type AccountPortfolioSnapshot = {
  timestamp: number;
  markets: AccountMarketPosition[];
};

export type GetAccountMarketPortfolioParameters = {
  accountAddress: Address;
  chainId?: number;
  marketId?: string;
  startTime: number;
  endTime: number;
  granularity?: "1h" | "6h" | "1d";
  network?: Chain;
};

export type GetAccountMarketPortfolioReturnType = Promise<{
  account: string;
  positions: AccountPortfolioSnapshot[];
}>;

export async function getAccountMarketPortfolio(
  client: MoonwellClient,
  args: GetAccountMarketPortfolioParameters,
): GetAccountMarketPortfolioReturnType {
  // Determine which environment to use
  let environment: Environment | undefined;

  // Get all environments as an array
  const environments = Object.values(client.environments);

  if (args.chainId) {
    environment = environments.find((env) => env.chainId === args.chainId);
  } else if (args.network && typeof args.network === "string") {
    const envValue = (client.environments as any)[args.network];
    if (envValue) {
      environment = envValue;
    }
  } else {
    // Default to first environment with lunar indexer
    environment = environments.find(
      (env) =>
        env.custom &&
        "morpho" in env.custom &&
        env.custom.morpho?.lunarIndexerUrl,
    );
  }

  if (!environment) {
    throw new Error("Environment not found");
  }

  const lunarIndexerUrl =
    environment.custom && "morpho" in environment.custom
      ? environment.custom.morpho?.lunarIndexerUrl
      : undefined;

  if (!lunarIndexerUrl) {
    throw new Error(
      "Lunar Indexer URL not configured for this environment. Account market portfolio requires lunar-indexer.",
    );
  }

  // Build options object with only defined values
  const options: {
    chainId?: number;
    marketId?: string;
    startTime?: number;
    endTime?: number;
    granularity?: "1h" | "6h" | "1d";
  } = {
    startTime: args.startTime,
    endTime: args.endTime,
  };

  if (args.chainId !== undefined) {
    options.chainId = args.chainId;
  }
  if (args.marketId !== undefined) {
    options.marketId = args.marketId;
  }
  if (args.granularity !== undefined) {
    options.granularity = args.granularity;
  }

  const response = await fetchAccountMarketPortfolioFromIndexer(
    lunarIndexerUrl,
    args.accountAddress,
    options,
  );

  // Transform positions to include marketKey
  const positions: AccountPortfolioSnapshot[] = response.positions.map(
    (position) => ({
      timestamp: position.timestamp,
      markets: position.markets.map((market) => {
        // Find the market key from environment config
        const marketKey = Object.keys(environment.config.morphoMarkets).find(
          (key) =>
            environment.config.morphoMarkets[key].id.toLowerCase() ===
            market.marketId.toLowerCase(),
        );

        return {
          chainId: market.chainId,
          marketId: market.marketId,
          marketKey: marketKey || market.marketId,
          supplyShares: market.supplyShares,
          borrowShares: market.borrowShares,
          collateral: market.collateral,
        };
      }),
    }),
  );

  return {
    account: response.account,
    positions,
  };
}
