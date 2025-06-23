import {
  http,
  createPublicClient,
  createWalletClient,
  erc20Abi,
  getContract,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { optimism } from "viem/chains";
import { describe, expect, test } from "vitest";
import { testClient, testRpcUrls } from "../../../test/client.js";

// Replace with your actual private key
const privateKey = "0x";

describe("Testing beam quote", () => {
  test("Should return a quote", async () => {
    const account = privateKeyToAccount(privateKey);
    const amount = 900000n;

    const walletClient = createWalletClient({
      account,
      chain: optimism,
      transport: http(testRpcUrls.optimism),
    });

    const publicClient = createPublicClient({
      chain: optimism,
      transport: http(testRpcUrls.optimism),
    });

    const result = await testClient.getBeamQuote({
      type: "supply",
      sources: [
        {
          address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          amount: 119009206n,
          chainId: 8453,
          decimals: 6,
          isNative: false,
          name: "USD Coin",
          permitEnabled: false,
          routeTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          symbol: "USDC",
        },
        {
          address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
          amount: 11971137n,
          chainId: 10,
          decimals: 6,
          isNative: false,
          name: "USD Coin",
          permitEnabled: false,
          routeTokenAddress: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
          symbol: "USDC",
        },
        {
          address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
          amount: 17600730n,
          chainId: 137,
          decimals: 6,
          isNative: false,
          name: "USD Coin",
          permitEnabled: false,
          routeTokenAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
          symbol: "USDC",
        },
      ],
      destination: {
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        chainId: 8453,
        decimals: 6,
        isNative: false,
        name: "USD Coin",
        permitEnabled: false,
        routeTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        symbol: "USDC",
      },
      wallet: walletClient,
    });

    if (result.status === "success") {
      for (const approval of result.checks.approvals) {
        const erc20Contract = getContract({
          address: approval.tokenAddress,
          abi: erc20Abi,
          client: walletClient,
        });

        const approveHash = await erc20Contract.write.approve([
          approval.spender,
          amount,
        ]);

        await publicClient.waitForTransactionReceipt({
          hash: approveHash,
          confirmations: 1,
        });
      }

      const receipt = await result.execute();

      await receipt.wait(1);

      const status = await receipt.status();

      return expect(status).toBe("success");
    }

    expect(result.status).toBe("error");
  });
});
