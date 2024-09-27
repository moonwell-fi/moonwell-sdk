import { moonriver as viem_moonrinverChain } from "viem/chains";
import { createNetwork } from "../../types/network.js";

export const moonriver = createNetwork<typeof viem_moonrinverChain>({
  chain: viem_moonrinverChain,
  testnet: false,
  custom: {},
});
