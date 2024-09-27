import { base } from "./base/network.js";
import { moonbeam } from "./moonbeam/network.js";
import { moonriver } from "./moonriver/network.js";

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

function createGovernanceTokensConfig<T extends GovernanceTokensType>(input: T) {
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
    chainIds: [moonbeam.chain.id, base.chain.id] as number[],
    testnet: false,
  },
  MFAM: {
    id: "MFAM",
    symbol: "MFAM",
    name: "MFAM",
    chainIds: [moonriver.chain.id] as number[],
    testnet: false,
  },
});

export type GovernanceToken = keyof typeof GovernanceTokensConfig;
