import type { ChainContract, Prettify, Chain as viemChain } from "viem";

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

export const createChain = <T>(config: {
  chain: T;
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
  const chain = {
    ...config.chain,
    testnet: config.testnet,
    custom: config.custom,
  };
  return chain as Prettify<typeof chain>;
};
