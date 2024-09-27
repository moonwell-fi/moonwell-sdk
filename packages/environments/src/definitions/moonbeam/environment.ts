import { base as viem_base } from "viem/chains";
import { createEnvironmenConfig } from "../../types/environment.js";
import { moonbeamMarketsList } from "./core-markets.js";
import { moonbeam } from "./network.js";
import { moonbeamTokenList } from "./tokens.js";

const createMoonbeamEnvironment = (rpcUrls: string[]) =>
  createEnvironmenConfig<typeof moonbeamTokenList, typeof moonbeamMarketsList>({
    name: "Moonbeam",
    network: moonbeam,
    apis: {
      indexerUrl: "https://ponder.moonwell.fi",
      rpcUrls,
    },
    tokens: moonbeamTokenList,
    contracts: {
      governanceToken: "WELL",
      stakingToken: "stkWELL",
      wrappedNativeToken: "WGLMR",
      core: {
        comptroller: "0x8E00D5e02E65A19337Cdba98bbA9F84d4186a180",
        views: "0xe76C8B8706faC85a8Fbdcac3C42e3E7823c73994",
        oracle: "0xED301cd3EB27217BDB05C4E9B820a8A3c8B665f9",
        governor: "0xfc4DFB17101A12C5CEc5eeDd8E92B5b16557666d",
        multichainGovernor: "0x9A8464C4C11CeA17e191653Deb7CdC1bE30F1Af4",
        markets: moonbeamMarketsList,
      },
    },
    settings: {
      governance: {
        token: "WELL",
        chainIds: [viem_base.id],
        proposalIdOffset: 79,
        snapshotEnsName: "moonwell-governance.eth",
      },
    },
  });

export { createMoonbeamEnvironment, moonbeam, moonbeamTokenList, moonbeamMarketsList };
