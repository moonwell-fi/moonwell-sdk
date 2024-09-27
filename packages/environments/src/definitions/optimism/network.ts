import { optimism as viem_optimismChain } from "viem/chains";
import { createNetwork } from "../../types/network.js";

export const optimism = createNetwork<typeof viem_optimismChain>({
  chain: viem_optimismChain,
  testnet: false,
  custom: {},
});
