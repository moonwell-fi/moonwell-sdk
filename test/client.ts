import { createMoonwellClient } from "../src/client/createMoonwellClient.js";
import { base } from "../src/environments/index.js";

export const baseClient = createMoonwellClient({
  networks: {
    base: {
      chain: base,
      rpcUrls: ["https://base.llamarpc.com"],
    },
  },
});
