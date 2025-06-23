// [!region imports]
import { createMoonwellClient } from "@moonwell-fi/moonwell-sdk";
// [!endregion imports]

export const moonwellClient = createMoonwellClient({
  networks: {
    base: {
      rpcUrls: [
        "https://lb.drpc.org/ogrpc?network=base&dkey=ArZpyASIn0ebhYYuxCc42yE2a4V5UDQR8JJvrqRhf0fE",
      ],
    },
    moonbeam: {
      rpcUrls: [
        "https://lb.drpc.org/ogrpc?network=moonbeam&dkey=ArZpyASIn0ebhYYuxCc42yE2a4V5UDQR8JJvrqRhf0fE",
      ],
    },
  },
});
