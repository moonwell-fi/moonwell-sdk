import { createMoonwellClient } from "../src/client/createMoonwellClient.js";
import {
  base,
  moonbeam,
  moonriver,
  optimism,
} from "../src/environments/index.js";

export const testClient = createMoonwellClient({
  networks: {
    base: {
      rpcUrls: [`https://rpc.moonwell.fi/main/evm/${base.id}`],
    },
    moonbeam: {
      rpcUrls: [`https://rpc.moonwell.fi/main/evm/${moonbeam.id}`],
    },
    moonriver: {
      rpcUrls: [`https://rpc.moonwell.fi/main/evm/${moonriver.id}`],
    },
    optimism: {
      rpcUrls: [`https://rpc.moonwell.fi/main/evm/${optimism.id}`],
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
