/**
 * Helper functions for working with Lunar Indexer marketId and tokenId formats
 */

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
