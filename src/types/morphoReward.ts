import type { TokenConfig } from "../environments/index.js";

export type MorphoReward = {
  marketId: string | undefined;
  asset: TokenConfig;
  supplyApr: number;
  supplyAmount: number;
  borrowApr: number;
  borrowAmount: number;
};
