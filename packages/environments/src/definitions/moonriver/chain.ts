import { moonriver as viem_moonrinverChain } from "viem/chains";
import { createChain } from "../../types/chain.js";

export const moonriver = createChain<typeof viem_moonrinverChain>({
  chain: viem_moonrinverChain,
  testnet: false,
  custom: {},
});
