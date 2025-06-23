import axios from "axios";
import { zeroAddress } from "viem";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import type { HttpRequestError } from "../../common/index.js";
import { getEnvironmentsFromArgs } from "../../common/index.js";
import type { TokenConfig } from "../../environments/index.js";
import type { BeamTokenInfo, BeamTokenRoutes } from "../../types/beam.js";

export type GetBeamTokenRoutesErrorType = HttpRequestError;

export type GetBeamTokenRoutesReturnType = Promise<BeamTokenRoutes[]>;

/**
 * Returns a list of the tokens that can have unified balances
 */
export async function getBeamTokenRoutes(
  client: MoonwellClient,
): GetBeamTokenRoutesReturnType {
  const environments = getEnvironmentsFromArgs(client, undefined, false);

  const acrossRoutesResponse = await axios.get<
    {
      originChainId: number;
      originToken: string;
      destinationChainId: number;
      destinationToken: string;
      originTokenSymbol: string;
      destinationTokenSymbol: string;
      isNative: boolean;
    }[]
  >("https://across.to/api/available-routes");

  const biconomyInfoResponse = await axios.get<{
    version: string;
    node: string;
    supportedChains: {
      chainId: string;
      name: string;
      healthCheck: {
        rpcOperational: boolean;
        debugTraceCallSupported: boolean;
        nativeBalance: string;
        nonce: number;
        execQueueActiveJobs: number;
        execQueuePendingJobs: number;
        gasConditionsAvailable: boolean;
        lastChecked: number;
        status: "healthy" | "unhealthy";
      };
    }[];
    supportedGasTokens: {
      chainId: number;
      paymentTokens: {
        name: string;
        address: string;
        symbol: string;
        decimals: number;
        permitEnabled: boolean;
      }[];
      isArbitraryPaymentTokensSupported: boolean;
    }[];
    timestamp: number;
  }>("https://network.biconomy.io/v1/info");

  const moonwellSupportedTokens = environments
    .flatMap((env) => {
      const tokens: (TokenConfig & { chainId: number })[] = Object.values(
        env.config.tokens,
      ).map((token) => {
        return {
          ...token,
          chainId: env.chainId,
        };
      });
      return tokens;
    })
    .filter(
      (r) =>
        r.symbol.toLowerCase() !== "usdbc" && r.symbol.toLowerCase() !== "weth",
    ); //How to handle it?

  const biconomyChains = biconomyInfoResponse.data.supportedChains
    .filter((supportedChain) => supportedChain.healthCheck.status === "healthy")
    .map((chain) => {
      return {
        ...chain,
        chainId: Number.parseInt(chain.chainId),
      };
    });

  const supportedRoutes = acrossRoutesResponse.data.filter((route) => {
    const originChainSupported = biconomyChains.find(
      (chain) => chain.chainId === route.originChainId,
    );
    const destinationChainSupported = biconomyChains.find(
      (chain) => chain.chainId === route.destinationChainId,
    );

    const originTokenSupported = moonwellSupportedTokens.find(
      (moonwellToken) =>
        moonwellToken.chainId === route.originChainId &&
        (route.isNative
          ? moonwellToken.address.toLowerCase() === zeroAddress &&
            route.originTokenSymbol.toLowerCase() ===
              moonwellToken.symbol.toLowerCase()
          : moonwellToken.address.toLowerCase() ===
            route.originToken.toLowerCase()),
    );

    const destinationTokenSupported = moonwellSupportedTokens.find(
      (moonwellToken) =>
        moonwellToken.chainId === route.destinationChainId &&
        (route.isNative
          ? moonwellToken.address.toLowerCase() === zeroAddress &&
            route.destinationTokenSymbol.toLowerCase() ===
              moonwellToken.symbol.toLowerCase()
          : moonwellToken.address.toLowerCase() ===
            route.destinationToken.toLowerCase()),
    );

    return (
      originTokenSupported &&
      destinationTokenSupported &&
      originChainSupported &&
      destinationChainSupported
    );
  });

  const tokens: (BeamTokenRoutes | undefined)[] = supportedRoutes.map(
    (supportedRoute) => {
      const destinationRoutes = supportedRoutes.filter(
        (route) =>
          route.originChainId === supportedRoute.originChainId &&
          route.originToken.toLowerCase() ===
            supportedRoute.originToken.toLowerCase(),
      );
      const originTokenInfo = moonwellSupportedTokens.find(
        (moonwellToken) =>
          (supportedRoute.isNative
            ? moonwellToken.address.toLowerCase() === zeroAddress &&
              supportedRoute.originTokenSymbol.toLowerCase() ===
                moonwellToken.symbol.toLowerCase()
            : moonwellToken.address.toLowerCase() ===
              supportedRoute.originToken.toLowerCase()) &&
          moonwellToken.chainId === supportedRoute.originChainId,
      );
      const originChainInfo = biconomyChains.find(
        (chain) => chain.chainId === supportedRoute.originChainId,
      );
      const originChainGasInfo = biconomyInfoResponse.data.supportedGasTokens
        .find((gas) => gas.chainId === supportedRoute.originChainId)
        ?.paymentTokens.find(
          (gas) =>
            gas.address.toLowerCase() ===
            supportedRoute.originToken.toLowerCase(),
        );

      if (destinationRoutes.length > 0 && originTokenInfo && originChainInfo) {
        const routesMap = destinationRoutes.map((destinationRoute) => {
          const destinationTokenInfo = moonwellSupportedTokens.find(
            (moonwellToken) =>
              (destinationRoute.isNative
                ? moonwellToken.address.toLowerCase() === zeroAddress &&
                  destinationRoute.destinationTokenSymbol.toLowerCase() ===
                    moonwellToken.symbol.toLowerCase()
                : moonwellToken.address.toLowerCase() ===
                  destinationRoute.destinationToken.toLowerCase()) &&
              moonwellToken.chainId === destinationRoute.destinationChainId,
          );
          const destinationChainInfo = biconomyChains.find(
            (chain) => chain.chainId === destinationRoute.destinationChainId,
          );
          const destinationChainGasInfo =
            biconomyInfoResponse.data.supportedGasTokens
              .find(
                (gas) => gas.chainId === destinationRoute.destinationChainId,
              )
              ?.paymentTokens.find(
                (gas) =>
                  gas.address.toLowerCase() ===
                  destinationRoute.destinationToken.toLowerCase(),
              );

          if (destinationChainInfo && destinationTokenInfo) {
            return {
              chainId: destinationChainInfo.chainId,
              address: destinationTokenInfo.address,
              routeTokenAddress: destinationRoute.destinationToken,
              name: destinationTokenInfo.name,
              symbol: destinationTokenInfo.symbol,
              decimals: destinationTokenInfo.decimals,
              isNative: destinationTokenInfo.address === zeroAddress,
              permitEnabled:
                destinationChainGasInfo?.permitEnabled === true || false,
            };
          }

          return undefined;
        });

        const routes = routesMap.filter(
          (route) => route !== undefined,
        ) as BeamTokenInfo[];

        const result: BeamTokenRoutes = {
          chainId: supportedRoute.originChainId,
          address: originTokenInfo.address,
          routeTokenAddress: supportedRoute.originToken,
          name: originTokenInfo.name,
          symbol: originTokenInfo.symbol,
          decimals: originTokenInfo.decimals,
          isNative: originTokenInfo.address === zeroAddress,
          permitEnabled: originChainGasInfo?.permitEnabled === true || false,
          routes: dedup<BeamTokenInfo>(routes),
        };

        return result;
      } else {
        return undefined;
      }
    },
  );

  const result = tokens.filter((t) => t !== undefined) as BeamTokenRoutes[];

  return dedup<BeamTokenRoutes>(result);
}

function dedup<
  T extends { chainId: number; routeTokenAddress: string; symbol: string },
>(array: T[]) {
  return array.reduce((agg: T[], current) => {
    const x = agg.find(
      (item: T) =>
        item.chainId === current.chainId &&
        item.routeTokenAddress === current.routeTokenAddress &&
        item.symbol === current.symbol,
    );
    if (!x) {
      return agg.concat([current]);
    } else {
      return agg;
    }
  }, [] as T[]);
}
