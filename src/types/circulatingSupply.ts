import type { TokenConfig } from "../environments/index.js";
export type CirculatingSupplySnapshot = {
  chainId: number;
  token: TokenConfig;
  circulatingSupply: number;
  timestamp: number;
};
