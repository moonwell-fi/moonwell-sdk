import { createMoonwellClient } from "../src/client/createMoonwellClient.js";

export const baseClient = createMoonwellClient({
  networks: {
    base: {
      rpcUrls: ["https://base.llamarpc.com"],
    },
  },
});
