// [!region imports]
import { createMoonwellClient } from "@moonwell-fi/moonwell-sdk";
// [!endregion imports]

export const moonwellClient = createMoonwellClient({
  networks: {
    base: {
      rpcUrls: ["https://rpc.moonwell.fi/main/evm/8453"],
    },
    ethereum: {
      rpcUrls: ["https://rpc.moonwell.fi/main/evm/1"],
    },
  },
});
