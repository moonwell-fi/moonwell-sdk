import { createMoonwellClient } from "../src/client/createMoonwellClient.js";

const moonwellRpc = (chainId: number) =>
  `https://rpc.moonwell.fi/main/evm/${chainId}`;

export const testRpcUrls = {
  ethereum: moonwellRpc(1),
  base: moonwellRpc(8453),
  optimism: moonwellRpc(10),
  arbitrum: moonwellRpc(42161),
  avalanche: moonwellRpc(43114),
  polygon: moonwellRpc(137),
  moonbeam: moonwellRpc(1284),
  moonriver: moonwellRpc(1285),
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
