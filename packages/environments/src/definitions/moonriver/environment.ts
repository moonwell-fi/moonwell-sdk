import { createEnvironmenConfig } from "../../types/environment.js";
import { moonriverMarketsList } from "./core-markets.js";
import { moonriver } from "./network.js";
import { moonriverTokenList } from "./tokens.js";

const createMoonriverEnvironment = (rpcUrls: string[]) =>
  createEnvironmenConfig<typeof moonriverTokenList, typeof moonriverMarketsList>({
    name: "Moonriver",
    network: moonriver,
    apis: {
      indexerUrl: "https://ponder.moonwell.fi",
      rpcUrls,
    },
    tokens: moonriverTokenList,
    contracts: {
      governanceToken: "MFAM",
      stakingToken: "stkMFAM",
      wrappedNativeToken: "WMOVR",
      core: {
        comptroller: "0x0b7a0EAA884849c6Af7a129e899536dDDcA4905E",
        views: "0xb4104C02BBf4E9be85AAa41a62974E4e28D59A33",
        oracle: "0x892bE716Dcf0A6199677F355f45ba8CC123BAF60",
        governor: "0x2BE2e230e89c59c8E20E633C524AD2De246e7370",
        markets: moonriverMarketsList,
      },
    },
    settings: {
      governance: {
        token: "MFAM",
        chainIds: [],
        snapshotEnsName: "moonwell-apollo-governance.eth",
      },
    },
  });

export { createMoonriverEnvironment, moonriver, moonriverTokenList, moonriverMarketsList };
