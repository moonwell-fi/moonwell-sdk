/**
 * Lunar Indexer API Client
 *
 * Client for interacting with the Lunar Indexer REST API endpoints.
 * Provides functions for fetching comptroller, market, token, and portfolio data.
 */

import axios, { type AxiosInstance, type AxiosError } from "axios";

// ============================================================================
// Type Definitions
// ============================================================================

export interface LunarIndexerConfig {
  baseUrl: string;
  timeout?: number;
}

export interface LunarPaginatedResponse<T> {
  results: T[];
  nextCursor: string | null;
}

export interface LunarSnapshotOptions {
  limit?: number;
  cursor?: string;
  granularity?: "15m" | "1h" | "6h" | "1d";
  startTime?: number;
  endTime?: number;
}

export interface LunarPortfolioOptions {
  startTime: number;
  endTime: number;
  granularity?: "1h" | "6h" | "1d";
  chainId?: number;
  market?: string;
}

export interface LunarComptroller {
  id: string;
  chainId: number;
  address: string;
  priceOracleAddress: string;
}

export interface LunarMarket {
  id: string;
  chainId: number;
  address: string;
  underlyingTokenAddress: string;
  collateralFactor: number;
  interestRateModelAddress: string;
  priceFeedAddress: string;
  reserveFactor: string;
  blockNumber: string;
  timestamp: number;
}

/**
 * Full market data with all real-time fields from Lunar Indexer
 * Based on actual API responses from /markets/:chainId and /market/:marketId
 */
export interface LunarMarketFull {
  id: string;
  chainId: number;
  address: string;
  underlyingTokenAddress: string;
  comptrollerAddress: string;

  totalBorrows: number;
  totalBorrowsUsd: number;
  totalSupply: number;
  totalSupplyUsd: number;
  totalReserves: number;
  totalReservesUsd: number;
  cash: number;
  cashUsd: number;
  badDebt: number;
  badDebtUsd: number;

  exchangeRate: number;
  priceUsd: number;
  baseSupplyApy: number;
  baseBorrowApy: number;

  mintPaused: boolean;
  borrowPaused: boolean;
  seizePaused: boolean;
  transferPaused: boolean;

  borrowCap: number;
  supplyCap: number;

  collateralFactor: number;
  reserveFactor: string;

  incentives: Array<{
    token: string;
    supplyIncentivesPerSec: string | number;
    borrowIncentivesPerSec: string | number;
    priceUsd: number | null;
    supplyApr: number | null;
    borrowApr: number | null;
  }>;

  underlyingToken: {
    id: string;
    chainId: number;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
  };

  blockNumber: string;
  timestamp: number;
}

export interface LunarMarketWithToken extends LunarMarket {
  underlyingToken: LunarToken;
}

export interface LunarToken {
  id: string;
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

export interface LunarMarketSnapshot {
  id: string;
  chainId: number;
  marketAddress: string;
  timestamp: number;
  blockNumber: string;
  totalBorrows: number;
  totalBorrowsUSD: number;
  totalSupplies: number;
  totalSuppliesUSD: number;
  totalLiquidity: number;
  totalLiquidityUSD: number;
  totalReserves: number;
  totalReservesUSD: number;
  baseSupplyApy: number;
  baseBorrowApy: number;
  timeInterval: number;
}

export interface LunarPortfolio {
  account: string;
  positions: Array<{
    timestamp: number;
    markets: Array<{
      chainId: number;
      marketAddress: string;
      supplyBalance: string;
      supplyBalanceUsd: string;
      borrowBalance: string;
      borrowBalanceUsd: string;
    }>;
  }>;
}

// ============================================================================
// Error Handling
// ============================================================================

export class LunarIndexerError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly endpoint?: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = "LunarIndexerError";
  }
}

/**
 * Determine if an error should trigger fallback to Ponder/on-chain
 */
export function shouldFallback(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    const isNetworkError = !axiosError.response;
    const is5xxError =
      !!axiosError.response && axiosError.response.status >= 500;
    const is404Error =
      !!axiosError.response && axiosError.response.status === 404;

    if (isNetworkError || is5xxError || is404Error) {
      return true;
    }

    // 4xx errors (except 404) should NOT fallback - fail fast
    return false;
  }

  // Unknown errors should fallback
  return true;
}

export const DEFAULT_LUNAR_TIMEOUT_MS = 10_000;

// ============================================================================
// Lunar Indexer Client Class
// ============================================================================

export class LunarIndexerClient {
  private client: AxiosInstance;

  constructor(config: LunarIndexerConfig) {
    this.client = axios.create({
      baseURL: `${config.baseUrl}/api/v1/lending`,
      timeout: config.timeout || DEFAULT_LUNAR_TIMEOUT_MS,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Get comptroller data for a specific chain
   */
  async getComptroller(chainId: number): Promise<LunarComptroller> {
    try {
      const response = await this.client.get<LunarComptroller>(
        `/comptroller/${chainId}`,
      );
      return response.data;
    } catch (error) {
      throw new LunarIndexerError(
        `Failed to fetch comptroller for chain ${chainId}`,
        axios.isAxiosError(error) ? error.response?.status : undefined,
        `/comptroller/${chainId}`,
        error as Error,
      );
    }
  }

  /**
   * List all markets for a specific chain with pagination
   * Returns full market data with real-time values, APYs, and incentives
   */
  async listMarkets(
    chainId: number,
    options?: { limit?: number; cursor?: string },
  ): Promise<LunarPaginatedResponse<LunarMarketFull>> {
    try {
      const params: Record<string, string> = {};
      if (options?.limit) params.limit = options.limit.toString();
      if (options?.cursor) params.cursor = options.cursor;

      const response = await this.client.get<
        LunarPaginatedResponse<LunarMarketFull>
      >(`/markets/${chainId}`, { params });
      return response.data;
    } catch (error) {
      throw new LunarIndexerError(
        `Failed to list markets for chain ${chainId}`,
        axios.isAxiosError(error) ? error.response?.status : undefined,
        `/markets/${chainId}`,
        error as Error,
      );
    }
  }

  /**
   * Get a single market by marketId (format: chainId-marketAddress)
   * Returns full market data with real-time values, APYs, and incentives
   */
  async getMarket(marketId: string): Promise<LunarMarketFull> {
    try {
      const response = await this.client.get<LunarMarketFull>(
        `/market/${marketId}`,
      );
      return response.data;
    } catch (error) {
      throw new LunarIndexerError(
        `Failed to fetch market ${marketId}`,
        axios.isAxiosError(error) ? error.response?.status : undefined,
        `/market/${marketId}`,
        error as Error,
      );
    }
  }

  /**
   * Get market snapshots with optional time range and granularity
   */
  async getMarketSnapshots(
    marketId: string,
    options?: LunarSnapshotOptions,
  ): Promise<LunarPaginatedResponse<LunarMarketSnapshot>> {
    try {
      const params: Record<string, string> = {};
      if (options?.limit) params.limit = options.limit.toString();
      if (options?.cursor) params.cursor = options.cursor;
      if (options?.granularity) params.granularity = options.granularity;
      if (options?.startTime) params.startTime = options.startTime.toString();
      if (options?.endTime) params.endTime = options.endTime.toString();

      const response = await this.client.get<
        LunarPaginatedResponse<LunarMarketSnapshot>
      >(`/market/${marketId}/snapshots`, { params });
      return response.data;
    } catch (error) {
      throw new LunarIndexerError(
        `Failed to fetch market snapshots for ${marketId}`,
        axios.isAxiosError(error) ? error.response?.status : undefined,
        `/market/${marketId}/snapshots`,
        error as Error,
      );
    }
  }

  /**
   * List all tokens for a specific chain with pagination
   */
  async listTokens(
    chainId: number,
    options?: { limit?: number; cursor?: string },
  ): Promise<LunarPaginatedResponse<LunarToken>> {
    try {
      const params: Record<string, string> = {};
      if (options?.limit) params.limit = options.limit.toString();
      if (options?.cursor) params.cursor = options.cursor;

      const response = await this.client.get<
        LunarPaginatedResponse<LunarToken>
      >(`/tokens/${chainId}`, { params });
      return response.data;
    } catch (error) {
      throw new LunarIndexerError(
        `Failed to list tokens for chain ${chainId}`,
        axios.isAxiosError(error) ? error.response?.status : undefined,
        `/tokens/${chainId}`,
        error as Error,
      );
    }
  }

  /**
   * Get a single token by tokenId (format: chainId-tokenAddress)
   */
  async getToken(tokenId: string): Promise<LunarToken> {
    try {
      const response = await this.client.get<LunarToken>(`/token/${tokenId}`);
      return response.data;
    } catch (error) {
      throw new LunarIndexerError(
        `Failed to fetch token ${tokenId}`,
        axios.isAxiosError(error) ? error.response?.status : undefined,
        `/token/${tokenId}`,
        error as Error,
      );
    }
  }

  /**
   * Get account portfolio with historical positions
   * NOTE: USD fields (supplyBalanceUsd, borrowBalanceUsd) are being added by Lunar team
   */
  async getAccountPortfolio(
    accountAddress: string,
    options: LunarPortfolioOptions,
  ): Promise<LunarPortfolio> {
    try {
      const params: Record<string, string> = {
        startTime: options.startTime.toString(),
        endTime: options.endTime.toString(),
      };
      if (options.granularity) params.granularity = options.granularity;
      if (options.chainId) params.chainId = options.chainId.toString();
      if (options.market) params.market = options.market;

      const response = await this.client.get<LunarPortfolio>(
        `/account/${accountAddress.toLowerCase()}/portfolio`,
        { params },
      );
      return response.data;
    } catch (error) {
      throw new LunarIndexerError(
        `Failed to fetch portfolio for account ${accountAddress}`,
        axios.isAxiosError(error) ? error.response?.status : undefined,
        `/account/${accountAddress}/portfolio`,
        error as Error,
      );
    }
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a new Lunar Indexer client instance
 */
export function createLunarIndexerClient(
  config: LunarIndexerConfig,
): LunarIndexerClient {
  return new LunarIndexerClient(config);
}
