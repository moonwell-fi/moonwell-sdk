import { createEnvironmenConfig } from "../../types/environment.js";
import { optimismMarketsList } from "./core-markets.js";
import { optimism } from "./network.js";
import { optimismTokenList } from "./tokens.js";

const createOptimismEnvironment = (rpcUrls: string[]) =>
  createEnvironmenConfig<typeof optimismTokenList, typeof optimismMarketsList>({
    name: "Optimism",
    network: optimism,
    apis: {
      indexerUrl: "https://ponder.moonwell.fi",
      rpcUrls,
    },
    tokens: optimismTokenList,
    contracts: {
      governanceToken: "WELL",
      stakingToken: "stkWELL",
      wrappedNativeToken: "WETH",
      core: {
        comptroller: "0xCa889f40aae37FFf165BccF69aeF1E82b5C511B9",
        views: "0x821Ff3a967b39bcbE8A018a9b1563EAf878bad39",
        multiRewardDistributor: "0xF9524bfa18C19C3E605FbfE8DFd05C6e967574Aa",
        oracle: "0x2f1490bD6aD10C9CE42a2829afa13EAc0b746dcf",
        router: "0xc4Ab8C031717d7ecCCD653BE898e0f92410E11dC",
        temporalGovernor: "0x17C9ba3fDa7EC71CcfD75f978Ef31E21927aFF3d",
        voteCollector: "0x3C968481BE3ba1a99fed5f73dB2Ff51151037738",
        markets: optimismMarketsList,
      },
    },
    settings: {
      governance: {
        token: "WELL",
        chainIds: [],
      },
    },
  });

export { optimism, createOptimismEnvironment, optimismMarketsList, optimismTokenList };
