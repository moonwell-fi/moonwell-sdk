import { createMoonwellClient } from "../src/client/createMoonwellClient.js";

export const apiKey = "ArZpyASIn0ebhYYuxCc42yE2a4V5UDQR8JJvrqRhf0fE";

export const testRpcUrls = {
  ethereum: `https://lb.drpc.org/ogrpc?network=ethereum&dkey=${apiKey}`,
  base: `https://lb.drpc.org/ogrpc?network=base&dkey=${apiKey}`,
  optimism: `https://lb.drpc.org/ogrpc?network=optimism&dkey=${apiKey}`,
  arbitrum: `https://lb.drpc.org/ogrpc?network=arbitrum&dkey=${apiKey}`,
  avalanche: `https://lb.drpc.org/ogrpc?network=avalanche&dkey=${apiKey}`,
  polygon: `https://lb.drpc.org/ogrpc?network=polygon&dkey=${apiKey}`,
  moonbeam: `https://lb.drpc.org/ogrpc?network=moonbeam&dkey=${apiKey}`,
  moonriver: `https://lb.drpc.org/ogrpc?network=moonriver&dkey=${apiKey}`,
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
