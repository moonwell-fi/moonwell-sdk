// [!region imports]
import { createMoonwellClient } from "@moonwell-fi/moonwell-sdk";
// [!endregion imports]

export const moonwellClient = createMoonwellClient({
  networks: {
    base: {
      rpcUrls: [
        "https://api-base-mainnet-archive.n.dwellir.com/5f017d19-2181-4eac-97c9-0f7574323e35",
      ],
    },
    moonbeam: {
      rpcUrls: ["https://rpc.moonwell.fi/main/evm/1284"],
    },
  },
});
