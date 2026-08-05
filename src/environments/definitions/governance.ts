import { base, mainnet, optimism } from "viem/chains";

export interface GovernanceTokenInfo {
  id: string;
  symbol: string;
  name: string;
  chainIds: Array<number>;
  testnet: boolean;
}

export interface GovernanceTokensType {
  [token: string]: GovernanceTokenInfo;
}

function createGovernanceTokensConfig<T extends GovernanceTokensType>(
  input: T,
) {
  return input;
}

export const GovernanceTokensConfig = createGovernanceTokensConfig({
  WELL: {
    id: "WELL",
    symbol: "WELL",
    name: "WELL",
    // Moonbeam (1284) dropped with the sunset (MOO-551): the chain is halted, so
    // it can no longer serve voting-power reads. MFAM/Moonriver is gone for the
    // same reason — Apollo governance ended with the chain.
    chainIds: [base.id, optimism.id, mainnet.id] as number[],
    testnet: false,
  },
});

export type GovernanceToken = keyof typeof GovernanceTokensConfig;
