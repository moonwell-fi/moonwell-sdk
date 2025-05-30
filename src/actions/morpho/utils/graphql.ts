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
