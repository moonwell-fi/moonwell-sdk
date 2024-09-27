import type { Chain, ChainContract } from "viem";

export type Network = {
  chain: Chain;
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

export const createNetwork = <const chain>(config: {
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
    chain: config.chain,
    testnet: config.testnet,
    custom: config.custom,
  };
  return result;
};
