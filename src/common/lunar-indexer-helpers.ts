/**
 * Helper functions for working with Lunar Indexer marketId and tokenId formats
 */

/**
 * Default lunar-indexer worker URL, used when an environment has no
 * `lunarIndexerUrl` configured. Mirrors the default in the environment
 * definitions so Merkl calls still resolve to the production proxy.
 */
const DEFAULT_LUNAR_INDEXER_URL =
  "https://lunar-services-worker.moonwell.workers.dev";

/**
 * Build the base URL for the Merkl proxy exposed by the lunar-indexer worker.
 *
 * Merkl's v4 API needs a server-side API key for production rate limits, and
 * the SDK runs in the browser where it cannot hold that secret. So all Merkl
 * requests go through the worker's `/api/v1/merkl` proxy, which injects the key
 * and passes the query/response through unchanged.
 *
 * @param lunarIndexerUrl - The environment's lunar-indexer base URL (falls back
 *   to the production worker when undefined)
 * @returns The Merkl proxy base URL, with no trailing slash
 */
export function getMerklProxyBaseUrl(lunarIndexerUrl?: string): string {
  return `${lunarIndexerUrl ?? DEFAULT_LUNAR_INDEXER_URL}/api/v1/merkl`;
}

/**
 * Build a marketId string from chainId and market address
 * Format: {chainId}-{marketAddress}
 * @param chainId - The chain ID
 * @param marketAddress - The market contract address
 * @returns Formatted marketId string
 */
export function buildMarketId(chainId: number, marketAddress: string): string {
  return `${chainId}-${marketAddress.toLowerCase()}`;
}

/**
 * Parse a marketId string into chainId and marketAddress
 * @param marketId - The marketId string to parse
 * @returns Object containing chainId and marketAddress
 */
export function parseMarketId(marketId: string): {
  chainId: number;
  marketAddress: string;
} {
  const [chainIdStr, ...addressParts] = marketId.split("-");
  return {
    chainId: Number.parseInt(chainIdStr, 10),
    marketAddress: addressParts.join("-"), // Handle addresses that might contain dashes
  };
}

/**
 * Build a tokenId string from chainId and token address
 * Format: {chainId}-{tokenAddress}
 * @param chainId - The chain ID
 * @param tokenAddress - The token contract address
 * @returns Formatted tokenId string
 */
export function buildTokenId(chainId: number, tokenAddress: string): string {
  return `${chainId}-${tokenAddress.toLowerCase()}`;
}

/**
 * Parse a tokenId string into chainId and tokenAddress
 * @param tokenId - The tokenId string to parse
 * @returns Object containing chainId and tokenAddress
 */
export function parseTokenId(tokenId: string): {
  chainId: number;
  tokenAddress: string;
} {
  const [chainIdStr, ...addressParts] = tokenId.split("-");
  return {
    chainId: Number.parseInt(chainIdStr, 10),
    tokenAddress: addressParts.join("-"), // Handle addresses that might contain dashes
  };
}
