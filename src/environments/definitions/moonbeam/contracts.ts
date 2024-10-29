import { createContractsConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const contracts = createContractsConfig({
  tokens,
  contracts: {
    governanceToken: "WELL",
    stakingToken: "stkWELL",
    wrappedNativeToken: "WGLMR",
    tokenSale: "0x933fCDf708481c57E9FD82f6BAA084f42e98B60e",
    comptroller: "0x8E00D5e02E65A19337Cdba98bbA9F84d4186a180",
    maximillion: "0xe5Ef9310cC7E3437bAD83466675f24FD62A380c3",
    views: "0xe76C8B8706faC85a8Fbdcac3C42e3E7823c73994",
    oracle: "0xED301cd3EB27217BDB05C4E9B820a8A3c8B665f9",
    governor: "0xfc4DFB17101A12C5CEc5eeDd8E92B5b16557666d",
    multichainGovernor: "0x9A8464C4C11CeA17e191653Deb7CdC1bE30F1Af4",
  },
});
