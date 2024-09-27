import { optimism as viem_optimismChain } from "viem/chains";
import { createChain } from "../../types/chain.js";

export const optimism = createChain<typeof viem_optimismChain>({
  chain: viem_optimismChain,
  testnet: false,
  custom: {},
});
