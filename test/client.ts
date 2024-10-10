import { createMoonwellClient } from "../src/client/createMoonwellClient.js";

export const baseClient = createMoonwellClient({
  networks: {
    base: {
      rpcUrls: ["https://base.llamarpc.com"],
    },
    // moonbeam: {
    //   rpcUrls: ["https://moonbeam-rpc.publicnode.com"]
    // },
    // moonriver: {
    //   rpcUrls: ["https://moonriver-rpc.publicnode.com"]
    // },
    // optimism: {
    //   rpcUrls: ["https://optimism-rpc.publicnode.com"]
    // }
  },
});
