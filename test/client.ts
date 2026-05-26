import { createMoonwellClient } from "../src/client/createMoonwellClient.js";

// Use the SDK's production default RPC endpoints (rpc.moonwell.fi) so tests
// exercise the same infrastructure consumers actually use. Previously these
// pointed at drpc.org with a hard-coded API key, which leaked the key in source
// control and caused the suite to flake on drpc's intermittent 5xx spikes.
export const testRpcUrls = {
  ethereum: "https://rpc.moonwell.fi/main/evm/1",
  base: "https://rpc.moonwell.fi/main/evm/8453",
  optimism: "https://rpc.moonwell.fi/main/evm/10",
  arbitrum: "https://rpc.moonwell.fi/main/evm/42161",
  avalanche: "https://rpc.moonwell.fi/main/evm/43114",
  polygon: "https://rpc.moonwell.fi/main/evm/137",
  moonbeam: "https://rpc.moonwell.fi/main/evm/1284",
  moonriver: "https://rpc.moonwell.fi/main/evm/1285",
};

export const testClient = createMoonwellClient({
  networks: {
    base: {
      rpcUrls: [testRpcUrls.base],
    },
    moonbeam: {
      rpcUrls: [testRpcUrls.moonbeam],
    },
    moonriver: {
      rpcUrls: [testRpcUrls.moonriver],
    },
    optimism: {
      rpcUrls: [testRpcUrls.optimism],
    },
    ethereum: {
      rpcUrls: [testRpcUrls.ethereum],
    },
    arbitrum: {
      rpcUrls: [testRpcUrls.arbitrum],
    },
    avalanche: {
      rpcUrls: [testRpcUrls.avalanche],
    },
    polygon: {
      rpcUrls: [testRpcUrls.polygon],
    },
  },
});
