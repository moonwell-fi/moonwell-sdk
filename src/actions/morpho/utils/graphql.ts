import { MOONWELL_FETCH_JSON_HEADERS } from "../../../common/fetch-headers.js";
import type { Environment } from "../../../environments/index.js";

export async function getGraphQL<T>(
  query: string,
  operationName?: string,
  variables?: any,
) {
  try {
    const response = await fetch("https://blue-api.morpho.org/graphql", {
      method: "POST",
      headers: MOONWELL_FETCH_JSON_HEADERS,
      body: JSON.stringify({ query: query, operationName, variables }),
      signal: AbortSignal.timeout(10000),
    });

    const json = await response.json();
    if (response.status !== 200 || json.errors) {
      console.log(
        `Non-200 (${response.statusText}
        }) or other error from Morpho GraphQL! - ${JSON.stringify(response.statusText)}`,
      );
      return undefined;
    }

    return json.data as T;
  } catch (error) {
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
      console.log(response);
      console.log(
        `Non-200 (${response.statusText}
        }) or other error from Morpho GraphQL! - ${JSON.stringify(response.statusText)}`,
      );
      return undefined;
    }

    return json.data as T;
  } catch (error) {
    return undefined;
  }
}

export async function getVaultV2Apy(vaultAddress: string, chainId: number) {
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
    const response = await fetch("https://api.morpho.org/graphql", {
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
      return undefined;
    }

    return json.data?.vaultV2ByAddress as
      | {
          address: string;
          avgApy: number;
          avgNetApy: number;
          totalAssets: string;
          totalAssetsUsd: number;
          totalSupply: string;
          liquidity: string;
          liquidityUsd: number;
          idleAssetsUsd: number;
          asset: {
            yield: {
              apr: number;
            };
          };
          performanceFee: number;
          managementFee: number;
          rewards: {
            asset: {
              address: string;
              chain: {
                id: number;
              };
            };
            supplyApr: number;
            yearlySupplyTokens: string;
          }[];
        }
      | undefined;
  } catch (error) {
    return undefined;
  }
}
