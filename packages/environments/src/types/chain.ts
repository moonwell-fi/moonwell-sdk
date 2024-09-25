import type { ChainContract, ChainFormatters, Chain as viem_Chain } from "viem";

export type Chain<
  formatters extends ChainFormatters | undefined = ChainFormatters | undefined,
> = viem_Chain<
  formatters,
  {
    wormhole?: {
      chainId: number;
      tokenBridge?: ChainContract | undefined;
    };
    socket?: {
      gateway?: ChainContract | undefined;
    };
    xWELL?: {
      bridgeAdapter?: ChainContract | undefined;
    };
  }
>;
