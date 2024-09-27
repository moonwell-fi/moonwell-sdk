import type { ChainContract, Chain as viemChain } from "viem";

export type Chain = viemChain & {
  testnet: boolean;
  custom?: {
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
  };
};

export const createChain = <const chain>(config: {
  chain: chain;
  testnet: boolean;
  custom: {
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
  };
}) => {
  const result = {
    ...config.chain,
    testnet: config.testnet,
    custom: config.custom,
  };
  return result;
};
