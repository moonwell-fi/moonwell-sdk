import {
  type GetFusionQuotePayload,
  createMeeClient,
  toMultichainNexusAccount,
} from "@biconomy/abstractjs";
import { http, type Address, type WalletClient } from "viem";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import {
  type Amount,
  type HttpRequestError,
  getEnvironmentsFromArgs,
} from "../../common/index.js";
import type { OptionalNetworkParameterType } from "../../common/types.js";
import { type Chain, moonbeam, moonriver } from "../../environments/index.js";
import type { BeamTokenInfo } from "../../types/beam.js";
import { MEE_CLIENT_API_KEY, getQuote } from "./common.js";
import { getBeamTokenRoutes } from "./getBeamTokenRoutes.js";

export type BeamTokenBalances = {
  account: `0x${string}`;
  token: BeamTokenInfo;
  balance: Amount;
};

export type GetBeamTokenBalancesErrorType = HttpRequestError;

export type GetBeamTokenBalancesReturnType = Promise<BeamTokenBalances[]>;

export type BeamTokenBalancesArgs = {};

export type BeamTokenBalancesParameters<
  environments,
  network extends Chain | undefined,
> = OptionalNetworkParameterType<environments, network> & {
  wallet: WalletClient;
} & BeamTokenBalancesArgs;

/**
 * Returns a list of the tokens that can have unified balances
 */
export async function getBeamTokenBalances<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: BeamTokenBalancesParameters<environments, Network>,
): GetBeamTokenBalancesReturnType {
  const routes = await getBeamTokenRoutes(client);

  const envs = getEnvironmentsFromArgs(client, undefined, false).filter((env) =>
    routes.find((route) => route.chainId === env.chainId),
  );

  const chains = Object.values(envs).map((env) => env.chain);

  const transports = chains.map((chain) => http(chain.rpcUrls.default.http[0]));

  const smartAccount = await toMultichainNexusAccount({
    signer: args.wallet as any,
    chains,
    transports,
  });

  for (const route of routes) {
    const address = smartAccount.addressOn(route.chainId);
  }

  return [];
}
