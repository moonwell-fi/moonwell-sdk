import { base, moonbeam, moonriver, optimism } from "viem/chains";

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
  WELL_TESTNET: {
    id: "WELL_TESTNET",
    symbol: "WELL",
    name: "WELL (Testnet)",
    chainIds: [] as number[],
    testnet: true,
  },
  WELL: {
    id: "WELL",
    symbol: "WELL",
    name: "WELL",
    chainIds: [moonbeam.id, base.id, optimism.id] as number[],
    testnet: false,
  },
  MFAM: {
    id: "MFAM",
    symbol: "MFAM",
    name: "MFAM",
    chainIds: [moonriver.id] as number[],
    testnet: false,
  },
});

export type GovernanceToken = keyof typeof GovernanceTokensConfig;
