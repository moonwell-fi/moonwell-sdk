import { type Quote, createAcrossClient } from "@across-protocol/app-sdk";
import {
  type CleanUp,
  type Instruction,
  createMeeClient,
  greaterThanOrEqualTo,
  runtimeERC20BalanceOf,
  runtimeEncodeAbiParameters,
  toMultichainNexusAccount,
} from "@biconomy/abstractjs";
import {
  http,
  createPublicClient,
  encodeFunctionData,
  getContract,
  parseAbi,
  zeroAddress,
} from "viem";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import { getEnvironmentsFromArgs } from "../../common/index.js";
import marketTokenAbi from "../../environments/abis/marketTokenAbi.js";
import morphoBlueAbi from "../../environments/abis/morphoBlueAbi.js";
import morphoVaultAbi from "../../environments/abis/morphoVaultAbi.js";
import {
  type Chain,
  type Environment,
  moonbeam,
  moonriver,
} from "../../environments/index.js";
import type {
  GetBeamQuoteParameters,
  GetBeamQuoteReturnType,
} from "./getBeamQuote.js";

const ACROSS_ABI = parseAbi([
  "function deposit(bytes32 depositor, bytes32 recipient, bytes32 inputToken, bytes32 outputToken, uint256 inputAmount, uint256 outputAmount, uint256 destinationChainId, bytes32 exclusiveRelayer, uint32 quoteTimestamp, uint32 fillDeadline, uint32 exclusivityParameter, bytes message)",
  "function depositV3(address depositor,address recipient,address inputToken,address outputToken,uint256 inputAmount,uint256 outputAmount,uint256 destinationChainId,address exclusiveRelayer,uint32 quoteTimestamp,uint32 fillDeadline,uint32 exclusivityParameter,bytes message)",
]);

const WRAP_ABI = parseAbi(["function deposit()"]);

const MEE_CLIENT_API_KEY = "mee_3ZkX3T823ZDfwsNiFsqj5oZS";

const ACROSS_INTEGRATOR_ID = "0x008e";

const findMarketToken = (
  environments: Environment[],
  chainId: number,
  underlyingTokenAddress: string,
) => {
  const originEnvironment = environments.find((env) => chainId === env.chainId);

  if (originEnvironment) {
    const underlyingTokenConfig = Object.keys(originEnvironment.config.tokens)
      .map((token) => {
        const marketToken = originEnvironment.config.tokens[token];
        return {
          ...marketToken,
          key: token,
        };
      })
      .find((token) => token.address === underlyingTokenAddress);

    if (underlyingTokenConfig) {
      const originMarket = Object.values(originEnvironment.config.markets).find(
        (market) => market.underlyingToken === underlyingTokenConfig.key,
      );

      if (originMarket) {
        return {
          underlyingToken:
            originEnvironment.config.tokens[originMarket.underlyingToken],
          marketToken:
            originEnvironment.config.tokens[originMarket.marketToken],
        };
      }
    }
  }

  return undefined;
};

const findIsolatedMarketToken = (
  environments: Environment[],
  chainId: number,
  underlyingTokenAddress: string,
) => {
  const originEnvironment = environments.find((env) => chainId === env.chainId);

  if (originEnvironment) {
    const underlyingTokenConfig = Object.keys(originEnvironment.config.tokens)
      .map((token) => {
        const marketToken = originEnvironment.config.tokens[token];
        return {
          ...marketToken,
          key: token,
        };
      })
      .find((token) => token.address === underlyingTokenAddress);

    if (underlyingTokenConfig) {
      const originMarket = Object.values(
        originEnvironment.config.morphoMarkets,
      ).find((market) => market.collateralToken === underlyingTokenConfig.key);

      if (originMarket) {
        return {
          underlyingToken:
            originEnvironment.config.tokens[originMarket.collateralToken],
          marketToken: originEnvironment.config.tokens[originMarket.loanToken],
        };
      }
    }
  }

  return undefined;
};

const findVaultToken = (
  environments: Environment[],
  chainId: number,
  underlyingTokenAddress: string,
) => {
  const originEnvironment = environments.find((env) => chainId === env.chainId);

  if (originEnvironment) {
    const underlyingTokenConfig = Object.keys(originEnvironment.config.tokens)
      .map((token) => {
        const marketToken = originEnvironment.config.tokens[token];
        return {
          ...marketToken,
          key: token,
        };
      })
      .find((token) => token.address === underlyingTokenAddress);

    if (underlyingTokenConfig) {
      const originMarket = Object.values(originEnvironment.config.vaults).find(
        (market) => market.underlyingToken === underlyingTokenConfig.key,
      );

      if (originMarket) {
        return {
          underlyingToken:
            originEnvironment.config.tokens[originMarket.underlyingToken],
          marketToken: originEnvironment.config.tokens[originMarket.vaultToken],
        };
      }
    }
  }

  return undefined;
};

export async function getQuote<environments, Network extends Chain | undefined>(
  client: MoonwellClient,
  args: GetBeamQuoteParameters<environments, Network>,
): GetBeamQuoteReturnType {
  const envs = getEnvironmentsFromArgs(client, undefined, false).filter(
    (env) => env.chainId !== moonbeam.id && env.chainId !== moonriver.id,
  );

  const chains = Object.values(envs).map((env) => env.chain);

  const transports = chains.map((chain) => http(chain.rpcUrls.default.http[0]));

  const smartAccount = await toMultichainNexusAccount({
    signer: args.wallet as any,
    chains,
    transports,
  });

  const meeClient = await createMeeClient({
    account: smartAccount,
    apiKey: MEE_CLIENT_API_KEY,
  });

  const accrossClient = createAcrossClient({
    integratorId: ACROSS_INTEGRATOR_ID, // 2-byte hex string
    chains,
    useTestnet: false,
  });

  if (
    args.type === "supply" ||
    args.type === "morpho-supply" ||
    args.type === "vault-deposit"
  ) {
    const tokenConfig =
      args.type === "supply"
        ? findMarketToken(
            envs,
            args.destination.chainId,
            args.destination.address,
          )
        : args.type === "morpho-supply"
          ? findIsolatedMarketToken(
              envs,
              args.destination.chainId,
              args.destination.address,
            )
          : findVaultToken(
              envs,
              args.destination.chainId,
              args.destination.address,
            );

    if (tokenConfig) {
      const quotes: Quote[] = [];
      const instructions: Instruction[][] = [];

      const approvals: {
        tokenAddress: `0x${string}`;
        spender: `0x${string}`;
        chainId: number;
        amount: bigint;
      }[] = [];

      const transfers: {
        to: `0x${string}`;
        chainId: number;
        amount: bigint;
      }[] = [];

      let totalOutput = 0n;

      const nativeAmounts: {
        chainId: number;
        amount: bigint;
      }[] = [];

      const cleanUps: CleanUp[] = [];

      for (const source of args.sources) {
        const sourceChain = chains.find((r) => r.id === source.chainId);

        const publicClient = createPublicClient({
          chain: sourceChain,
          transport: http(sourceChain!.rpcUrls.default.http[0]),
        });

        const nativeBalance = await publicClient.getBalance({
          address: args.wallet.account?.address as `0x${string}`,
        });

        nativeAmounts.push({
          chainId: source.chainId,
          amount: nativeBalance,
        });

        if (source.address === zeroAddress) {
          const nativeBalanceSmartAccount = await publicClient.getBalance({
            address: smartAccount.addressOn(source.chainId) as `0x${string}`,
          });

          if (nativeBalanceSmartAccount < source.amount) {
            transfers.push({
              amount: source.amount - nativeBalanceSmartAccount,
              chainId: source.chainId,
              to: smartAccount.addressOn(source.chainId) as `0x${string}`,
            });
          }

          cleanUps.push({
            tokenAddress: source.address as `0x${string}`,
            chainId: source.chainId,
            recipientAddress: args.wallet.account!.address,
          });
        } else {
          const erc20Abi = parseAbi([
            "function allowance(address owner, address spender) view returns (uint256)",
          ]);

          const erc20Contract = getContract({
            address: source.routeTokenAddress as `0x${string}`,
            abi: erc20Abi,
            client: publicClient,
          });

          const allowance = await erc20Contract.read.allowance([
            args.wallet.account?.address as `0x${string}`,
            smartAccount.addressOn(source.chainId) as `0x${string}`,
          ]);

          if (allowance < source.amount) {
            approvals.push({
              spender: smartAccount.addressOn(source.chainId) as `0x${string}`,
              tokenAddress: source.routeTokenAddress as `0x${string}`,
              chainId: source.chainId,
              amount: source.amount,
            });
          }
        }

        let transferOrWrapInstruction: Instruction[] = [];
        if (source.address === zeroAddress) {
          const wrapData = encodeFunctionData({
            abi: WRAP_ABI,
            functionName: "deposit",
            args: [],
          });

          transferOrWrapInstruction = await smartAccount.buildComposable({
            type: "rawCalldata",
            data: {
              calldata: wrapData,
              to: source.routeTokenAddress as `0x${string}`,
              chainId: source.chainId,
              value: source.amount,
            },
          });
        } else {
          transferOrWrapInstruction = await smartAccount.buildComposable({
            type: "transferFrom",
            data: {
              sender: args.wallet.account?.address as `0x${string}`,
              recipient: smartAccount.addressOn(
                source.chainId,
              ) as `0x${string}`,
              tokenAddress: source.routeTokenAddress as `0x${string}`,
              amount: source.amount,
              chainId: source.chainId,
            },
          });
        }

        if (source.chainId !== args.destination.chainId) {
          const acrossQuote = await accrossClient.getQuote({
            route: {
              originChainId: source.chainId,
              inputToken: source.routeTokenAddress as `0x${string}`,
              destinationChainId: args.destination.chainId,
              outputToken: args.destination.routeTokenAddress as `0x${string}`,
            },
            inputAmount: source.amount.toString(),
            recipient: smartAccount.addressOn(
              args.destination.chainId,
            ) as `0x${string}`,
          });

          const acrossChainInfo = await accrossClient.getChainInfo(
            source.chainId,
          );

          const approveAcrossSpendInstructions =
            await smartAccount.buildComposable({
              type: "approve",
              data: {
                tokenAddress: source.routeTokenAddress as `0x${string}`,
                amount: source.amount,
                chainId: source.chainId,
                spender: acrossChainInfo.spokePool,
              },
            });

          const bridgeData = encodeFunctionData({
            abi: ACROSS_ABI,
            functionName: "depositV3",
            args: [
              smartAccount.addressOn(source.chainId) as `0x${string}`,
              smartAccount.addressOn(args.destination.chainId) as `0x${string}`,
              acrossQuote.deposit.inputToken as `0x${string}`,
              acrossQuote.deposit.outputToken as `0x${string}`,
              acrossQuote.deposit.inputAmount,
              acrossQuote.deposit.outputAmount,
              acrossQuote.deposit.destinationChainId as unknown as bigint,
              acrossQuote.deposit.exclusiveRelayer as `0x${string}`,
              acrossQuote.deposit.quoteTimestamp as unknown as number,
              acrossQuote.deposit.fillDeadline as unknown as number,
              acrossQuote.deposit.exclusivityDeadline as unknown as number,
              acrossQuote.deposit.message as `0x${string}`,
            ],
          });

          totalOutput += acrossQuote.deposit.outputAmount;

          const bridgeInstructions = await smartAccount.buildComposable({
            type: "rawCalldata",
            data: {
              calldata: bridgeData,
              to: acrossChainInfo.spokePool,
              chainId: source.chainId,
            },
          });

          quotes.push(acrossQuote);

          instructions.push(
            await smartAccount.buildComposable({
              type: "batch",
              data: {
                instructions: [
                  transferOrWrapInstruction,
                  approveAcrossSpendInstructions,
                  bridgeInstructions,
                ],
              },
            }),
          );
        } else {
          totalOutput += source.amount;
          instructions.push(transferOrWrapInstruction);
        }
      }

      // Approve the contract to spend USDC
      const approveSupplyInstructions = await smartAccount.buildComposable({
        type: "approve",
        data: {
          tokenAddress: args.destination.routeTokenAddress as `0x${string}`,
          amount: runtimeERC20BalanceOf({
            tokenAddress: args.destination.routeTokenAddress as `0x${string}`,
            targetAddress: smartAccount.addressOn(
              args.destination.chainId,
              true,
            ),
            constraints: [greaterThanOrEqualTo(totalOutput)],
          }),
          chainId: args.destination.chainId,
          spender:
            args.type === "morpho-supply"
              ? args.destination.morphoBlue
              : tokenConfig.marketToken.address,
        },
      });

      if (args.type === "supply") {
        const supplyInstructions = await smartAccount.buildComposable({
          type: "default",
          data: {
            to: tokenConfig.marketToken.address,
            abi: marketTokenAbi,
            functionName: "mint",
            args: [
              runtimeEncodeAbiParameters(
                [{ name: "amount", type: "uint256" }],
                [
                  runtimeERC20BalanceOf({
                    targetAddress: smartAccount.addressOn(
                      args.destination.chainId,
                      true,
                    ),
                    tokenAddress: args.destination
                      .routeTokenAddress as `0x${string}`,
                    constraints: [greaterThanOrEqualTo(totalOutput)],
                  }),
                ],
              ),
            ], // Pass as a single bytes parameter
            chainId: args.destination.chainId,
          },
        });

        const transferBack = await smartAccount.buildComposable({
          type: "transfer",
          data: {
            amount: runtimeERC20BalanceOf({
              tokenAddress: tokenConfig.marketToken.address,
              targetAddress: smartAccount.addressOn(
                args.destination.chainId,
                true,
              ),
              constraints: [greaterThanOrEqualTo(1n)],
            }),
            chainId: args.destination.chainId,
            recipient: args.wallet.account!.address,
            tokenAddress: tokenConfig.marketToken.address,
          },
        });

        const batchedInstructions = await smartAccount.buildComposable({
          type: "batch",
          data: {
            instructions: [
              approveSupplyInstructions,
              supplyInstructions,
              transferBack,
            ],
          },
        });

        instructions.push(batchedInstructions);
      } else if (args.type === "morpho-supply") {
        const supplyCollateralData = encodeFunctionData({
          abi: morphoBlueAbi,
          functionName: "supplyCollateral",
          args: [
            {
              loanToken: args.destination.marketParams?.loanToken,
              collateralToken: args.destination.marketParams?.collateralToken,
              oracle: args.destination.marketParams?.oracle,
              irm: args.destination.marketParams?.irm,
              lltv: args.destination.marketParams?.lltv,
            },
            totalOutput,
            args.wallet.account!.address,
            "0x",
          ],
        });

        const supplyInstructions = await smartAccount.buildComposable({
          type: "rawCalldata",
          data: {
            calldata: supplyCollateralData,
            to: args.destination.morphoBlue,
            chainId: args.destination.chainId,
            value: 0n,
          },
        });

        // const supplyInstructions = await smartAccount.buildComposable({
        //   type: "default",
        //   data: {
        //     to: args.destination.morphoBlue,
        //     abi: morphoBlueAbi,
        //     functionName: "supplyCollateral",
        //     args: [runtimeEncodeAbiParameters(
        //       [
        //         {
        //           components: [
        //             {
        //               internalType: "address",
        //               name: "loanToken",
        //               type: "address",
        //             },
        //             {
        //               internalType: "address",
        //               name: "collateralToken",
        //               type: "address",
        //             },
        //             {
        //               internalType: "address",
        //               name: "oracle",
        //               type: "address",
        //             },
        //             {
        //               internalType: "address",
        //               name: "irm",
        //               type: "address",
        //             },
        //             {
        //               internalType: "uint256",
        //               name: "lltv",
        //               type: "uint256",
        //             },
        //           ],
        //           internalType: "struct MarketParams",
        //           name: "marketParams",
        //           type: "tuple",
        //         },
        //         {
        //           internalType: "uint256",
        //           name: "assets",
        //           type: "uint256",
        //         },
        //         {
        //           internalType: "address",
        //           name: "onBehalf",
        //           type: "address",
        //         },
        //         {
        //           internalType: "bytes",
        //           name: "data",
        //           type: "bytes",
        //         },
        //       ],
        //       [
        //         {
        //           loanToken: args.destination.marketParams?.loanToken,
        //           collateralToken: args.destination.marketParams?.collateralToken,
        //           oracle: args.destination.marketParams?.oracle,
        //           irm: args.destination.marketParams?.irm,
        //           lltv: args.destination.marketParams?.lltv,
        //         },
        //         runtimeERC20BalanceOf({
        //           targetAddress: smartAccount.addressOn(args.destination.chainId, true),
        //           tokenAddress: args.destination.routeTokenAddress as `0x${string}`,
        //           constraints: [greaterThanOrEqualTo(totalOutput)]
        //         }),
        //         args.wallet.account!.address,
        //         "0x",
        //       ]
        //     )],
        //     chainId: args.destination.chainId,
        //   }
        // });

        const batchedInstructions = await smartAccount.buildComposable({
          type: "batch",
          data: {
            instructions: [approveSupplyInstructions, supplyInstructions],
          },
        });

        instructions.push(batchedInstructions);
      } else if (args.type === "vault-deposit") {
        const depositData = encodeFunctionData({
          abi: morphoVaultAbi,
          functionName: "deposit",
          args: [totalOutput, args.wallet.account!.address],
        });

        const depositInstructions = await smartAccount.buildComposable({
          type: "rawCalldata",
          data: {
            calldata: depositData,
            to: tokenConfig.marketToken.address,
            chainId: args.destination.chainId,
            value: 0n,
          },
        });

        const batchedInstructions = await smartAccount.buildComposable({
          type: "batch",
          data: {
            instructions: [approveSupplyInstructions, depositInstructions],
          },
        });

        instructions.push(batchedInstructions);
      }

      const fusionQuote = await meeClient.getFusionQuote({
        trigger: {
          tokenAddress: zeroAddress,
          chainId: args.destination.chainId,
          amount: 1n,
        },
        feeToken: {
          address: zeroAddress,
          chainId: args.destination.chainId,
        },
        instructions,
        cleanUps: [
          ...cleanUps,
          {
            tokenAddress: args.destination.routeTokenAddress as `0x${string}`,
            chainId: args.destination.chainId,
            recipientAddress: args.wallet.account!.address,
          },
        ],
      });

      return {
        status: "success",
        checks: {
          approvals,
          transfers,
        },
        account: args.wallet.account,
        instructions,
        quote: {
          hash: fusionQuote.quote.hash,
          node: fusionQuote.quote.node,
          commitment: fusionQuote.quote.commitment,
          fee: {
            tokenAmount: fusionQuote.quote.paymentInfo.tokenAmount,
            tokenWeiAmount: fusionQuote.quote.paymentInfo.tokenWeiAmount,
            tokenValue: fusionQuote.quote.paymentInfo.tokenValue,
          },
          userOps: fusionQuote.quote.userOps.map((operation) => ({
            sender: operation.userOp.sender,
            nonce: operation.userOp.nonce,
            initCode: operation.userOp.initCode,
            callData: operation.userOp.callData,
          })),
          fusionQuote,
        },
        execute: async () => {
          try {
            const superTx = await meeClient.executeFusionQuote({
              fusionQuote,
            });

            return {
              hash: superTx.hash,
              wait: async (confirmations: number) => {
                await meeClient.waitForSupertransactionReceipt({
                  hash: superTx.hash,
                  confirmations,
                });

                return;
              },
              status: async () => {
                const receipt = await meeClient.getSupertransactionReceipt({
                  hash: superTx.hash,
                });

                if (
                  args.type === "supply" ||
                  args.type === "morpho-supply" ||
                  args.type === "vault-deposit"
                ) {
                  try {
                    //cleanup ops
                    receipt.userOps.splice(
                      receipt.userOps.length - (1 + cleanUps.length),
                    );

                    const supplyOp = receipt.userOps.splice(
                      receipt.userOps.length - 1,
                    );
                    const acrossOps = [...receipt.userOps];

                    const acrossOpsPending =
                      acrossOps.filter(
                        (op) =>
                          op.executionStatus === "MINING" ||
                          op.executionStatus === "PENDING",
                      ).length > 0;
                    const acrossOpsFailed =
                      acrossOps.filter(
                        (op) =>
                          op.executionStatus === "FAILED" ||
                          op.executionStatus === "MINED_FAIL",
                      ).length > 0;
                    const acrossOpsSucceed =
                      acrossOps.filter(
                        (op) =>
                          op.executionStatus === "MINED_SUCCESS" ||
                          op.executionStatus === "SUCCESS",
                      ).length === acrossOps.length;

                    const supplyOpPending =
                      supplyOp.filter(
                        (op) =>
                          op.executionStatus === "MINING" ||
                          op.executionStatus === "PENDING",
                      ).length > 0;
                    const supplyOpFailed =
                      supplyOp.filter(
                        (op) =>
                          op.executionStatus === "FAILED" ||
                          op.executionStatus === "MINED_FAIL",
                      ).length > 0;
                    const supplyOpSucceed =
                      supplyOp.filter(
                        (op) =>
                          op.executionStatus === "MINED_SUCCESS" ||
                          op.executionStatus === "SUCCESS",
                      ).length === supplyOp.length;

                    if (acrossOpsFailed || supplyOpFailed) {
                      return "reverted";
                    }

                    if (acrossOpsPending || supplyOpPending) {
                      return "processing";
                    }

                    if (acrossOpsSucceed || supplyOpSucceed) {
                      return "success";
                    }
                  } catch (ex) {
                    return "pending";
                  }
                }

                return "pending";
              },
            };
          } catch (ex) {
            console.log(ex);
            throw ex;
          }
        },
      };
    }
  }

  return {
    status: "error",
    error: "Token not found",
  };
}
