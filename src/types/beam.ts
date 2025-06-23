import type { Amount } from "../common/amount.js";
import type { TokenConfig } from "../environments/index.js";

export type BeamTokenInfo = TokenConfig & {
  chainId: number;
  routeTokenAddress: string;
  permitEnabled: boolean;
  isNative: boolean;
};

export type BeamTokenRoutes = BeamTokenInfo & {
  routes: BeamTokenInfo[];
};

export type BeamTokenLimits = {
  from: TokenConfig & { chainId: number; routeTokenAddress: string };
  to: TokenConfig & { chainId: number; routeTokenAddress: string };
  min: Amount;
  max: Amount;
};
