// [!region imports]
import { createMoonwellClient } from "@moonwell-fi/moonwell-sdk";
// [!endregion imports]

export const moonwellClient = createMoonwellClient({
  networks: {
    base: {
      rpcUrls: ["https://base.llamarpc.com"],
    },
    moonbeam: {
      rpcUrls: ["https://moonbeam.public.blastapi.io"],
    },
  },
});
