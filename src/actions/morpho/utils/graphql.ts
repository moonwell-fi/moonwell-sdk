import { MOONWELL_FETCH_JSON_HEADERS } from "../../../common/fetch-headers.js";
import type { Environment } from "../../../environments/index.js";
import type { MorphoVaultV2ApyResponse } from "../../../types/morphoVault.js";

export async function getGraphQL<T>(
  environment: Environment,
  query: string,
  operationName?: string,
  variables?: any,
) {
  try {
    const url =
      environment.custom.morpho?.blueApiUrl ||
      "https://blue-api.morpho.org/graphql";
    const response = await fetch(url, {
      method: "POST",
      headers: MOONWELL_FETCH_JSON_HEADERS,
      body: JSON.stringify({ query: query, operationName, variables }),
      signal: AbortSignal.timeout(10000),
    });

    const json = await response.json();
    if (response.status !== 200 || json.errors) {
      if (typeof window !== "undefined") {
        console.debug(
          `[Morpho GraphQL] Non-200 (${response.statusText}) or errors:`,
          json.errors,
        );
      }
      return undefined;
    }

    return json.data as T;
  } catch (error) {
    if (typeof window !== "undefined") {
      console.debug("[Morpho GraphQL] Error fetching data:", error);
    }
    return undefined;
  }
}

export async function getSubgraph<T>(
  environment: Environment,
  query: string,
  operationName?: string,
  variables?: any,
) {
  const url = environment.custom.morpho?.subgraphUrl!;

  const body: any = { query };
  if (operationName) {
    body.operationName = operationName;
  }
  if (variables) {
    body.variables = variables;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: MOONWELL_FETCH_JSON_HEADERS,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    const json = await response.json();
    if (response.status !== 200 || json.errors) {
      if (typeof window !== "undefined") {
        console.debug(
          `[Morpho Subgraph] Non-200 (${response.statusText}) or errors:`,
          json.errors,
        );
      }
      return undefined;
    }

    return json.data as T;
  } catch (error) {
    if (typeof window !== "undefined") {
      console.debug("[Morpho Subgraph] Error fetching data:", error);
    }
    return undefined;
  }
}

export async function getVaultV2Apy(
  environment: Environment,
  vaultAddress: string,
  chainId: number,
): Promise<MorphoVaultV2ApyResponse | undefined> {
  const query = `
    query VaultV2Apy($address: String!, $chainId: Int!) {
      vaultV2ByAddress(address: $address, chainId: $chainId) {
        address
        avgApy
        avgNetApy
        totalAssets
        totalAssetsUsd
        totalSupply
        liquidity
        liquidityUsd
        idleAssetsUsd
        asset {
          yield {
            apr
          }
        }
        performanceFee
        managementFee
        rewards {
          asset {
            address
            chain {
              id
            }
          }
          supplyApr
          yearlySupplyTokens
        }
      }
    }
  `;

  try {
    const url =
      environment.custom.morpho?.apiUrl || "https://api.morpho.org/graphql";
    const response = await fetch(url, {
      method: "POST",
      headers: MOONWELL_FETCH_JSON_HEADERS,
      body: JSON.stringify({
        query,
        variables: {
          address: vaultAddress,
          chainId,
        },
      }),
      signal: AbortSignal.timeout(10000),
    });

    const json = await response.json();
    if (response.status !== 200 || json.errors) {
      if (typeof window !== "undefined") {
        console.debug(
          `[Morpho V2 APY] Non-200 (${response.statusText}) or errors:`,
          json.errors,
        );
      }
      return undefined;
    }

    return json.data?.vaultV2ByAddress as MorphoVaultV2ApyResponse | undefined;
  } catch (error) {
    if (typeof window !== "undefined") {
      console.debug("[Morpho V2 APY] Error fetching data:", error);
    }
    return undefined;
  }
}
