import type { Chain, Prettify, Transport } from "viem";
import { type GovernanceToken, type GovernanceTokenInfo, GovernanceTokensConfig, type GovernanceTokensType } from "./definitions/governance.js";
import { base, type markets as baseMarkets, type morphoMarkets as baseMorphoMarkets, type tokens as baseTokens, type vaults as baseVaults, createEnvironment as createBaseEnvironment } from "./definitions/base/environment.js";
import { createEnvironment as createMoonbeamEnvironment, type markets as moonbeamMarkets, type tokens as moonbeamTokens } from "./definitions/moonbeam/environment.js";
import { createEnvironment as createMoonriverEnvironment, type markets as moonriverMarkets, type tokens as moonriverTokens } from "./definitions/moonriver/environment.js";
import { createEnvironment as createOptimismEnvironment, type markets as optimismMarkets, type tokens as optimismTokens } from "./definitions/optimism/environment.js";
import { moonbeam, moonriver, optimism } from "viem/chains";
import type { Environment, TokenConfig } from "./types/config.js";
export type { GovernanceToken, GovernanceTokenInfo, GovernanceTokensType, Environment, BaseEnvironment, MoonbeamEnvironment, MoonriverEnvironment, OptimismEnvironment, Chain, Prettify, Transport, SupportedChains, TokenConfig, };
export { base, GovernanceTokensConfig, moonbeam, moonriver, optimism, supportedChains, };
declare const supportedChains: {
    base: {
        blockExplorers: {
            readonly default: {
                readonly name: "Basescan";
                readonly url: "https://basescan.org";
                readonly apiUrl: "https://api.basescan.org/api";
            };
        };
        contracts: {
            readonly l2OutputOracle: {
                readonly 1: {
                    readonly address: "0x56315b90c40730925ec5485cf004d835058518A0";
                };
            };
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 5022;
            };
            readonly portal: {
                readonly 1: {
                    readonly address: "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e";
                    readonly blockCreated: 17482143;
                };
            };
            readonly l1StandardBridge: {
                readonly 1: {
                    readonly address: "0x3154Cf16ccdb4C6d922629664174b904d80F2C35";
                    readonly blockCreated: 17482143;
                };
            };
            readonly gasPriceOracle: {
                readonly address: "0x420000000000000000000000000000000000000F";
            };
            readonly l1Block: {
                readonly address: "0x4200000000000000000000000000000000000015";
            };
            readonly l2CrossDomainMessenger: {
                readonly address: "0x4200000000000000000000000000000000000007";
            };
            readonly l2Erc721Bridge: {
                readonly address: "0x4200000000000000000000000000000000000014";
            };
            readonly l2StandardBridge: {
                readonly address: "0x4200000000000000000000000000000000000010";
            };
            readonly l2ToL1MessagePasser: {
                readonly address: "0x4200000000000000000000000000000000000016";
            };
        };
        id: 8453;
        name: "Base";
        nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://mainnet.base.org"];
            };
        };
        sourceId: 1;
        testnet: false;
        custom?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters: {
            readonly block: {
                exclude: [] | undefined;
                format: (args: import("viem/chains").OpStackRpcBlock<import("viem").BlockTag, boolean>) => {
                    baseFeePerGas: bigint | null;
                    blobGasUsed: bigint;
                    difficulty: bigint;
                    excessBlobGas: bigint;
                    extraData: `0x${string}`;
                    gasLimit: bigint;
                    gasUsed: bigint;
                    hash: `0x${string}` | null;
                    logsBloom: `0x${string}` | null;
                    miner: `0x${string}`;
                    mixHash: `0x${string}`;
                    nonce: `0x${string}` | null;
                    number: bigint | null;
                    parentBeaconBlockRoot?: `0x${string}` | undefined;
                    parentHash: `0x${string}`;
                    receiptsRoot: `0x${string}`;
                    sealFields: `0x${string}`[];
                    sha3Uncles: `0x${string}`;
                    size: bigint;
                    stateRoot: `0x${string}`;
                    timestamp: bigint;
                    totalDifficulty: bigint | null;
                    transactions: `0x${string}`[] | import("viem/chains").OpStackTransaction<boolean>[];
                    transactionsRoot: `0x${string}`;
                    uncles: `0x${string}`[];
                    withdrawals?: import("viem").Withdrawal[] | undefined;
                    withdrawalsRoot?: `0x${string}` | undefined;
                };
                type: "block";
            };
            readonly transaction: {
                exclude: [] | undefined;
                format: (args: import("viem/chains").OpStackRpcTransaction<boolean>) => {
                    blockHash: `0x${string}` | null;
                    blockNumber: bigint | null;
                    from: `0x${string}`;
                    gas: bigint;
                    hash: `0x${string}`;
                    input: `0x${string}`;
                    nonce: number;
                    r: `0x${string}`;
                    s: `0x${string}`;
                    to: `0x${string}` | null;
                    transactionIndex: number | null;
                    typeHex: `0x${string}` | null;
                    v: bigint;
                    value: bigint;
                    yParity: number;
                    gasPrice?: undefined;
                    maxFeePerBlobGas?: undefined;
                    maxFeePerGas: bigint;
                    maxPriorityFeePerGas: bigint;
                    isSystemTx?: boolean;
                    mint?: bigint | undefined;
                    sourceHash: `0x${string}`;
                    type: "deposit";
                } | {
                    r: `0x${string}`;
                    s: `0x${string}`;
                    v: bigint;
                    to: `0x${string}` | null;
                    from: `0x${string}`;
                    gas: bigint;
                    nonce: number;
                    value: bigint;
                    blockHash: `0x${string}` | null;
                    blockNumber: bigint | null;
                    hash: `0x${string}`;
                    input: `0x${string}`;
                    transactionIndex: number | null;
                    typeHex: `0x${string}` | null;
                    accessList?: undefined;
                    authorizationList?: undefined;
                    blobVersionedHashes?: undefined;
                    chainId?: number | undefined;
                    yParity?: undefined;
                    type: "legacy";
                    gasPrice: bigint;
                    maxFeePerBlobGas?: undefined;
                    maxFeePerGas?: undefined;
                    maxPriorityFeePerGas?: undefined;
                    isSystemTx?: undefined;
                    mint?: undefined;
                    sourceHash?: undefined;
                } | {
                    blockHash: `0x${string}` | null;
                    blockNumber: bigint | null;
                    from: `0x${string}`;
                    gas: bigint;
                    hash: `0x${string}`;
                    input: `0x${string}`;
                    nonce: number;
                    r: `0x${string}`;
                    s: `0x${string}`;
                    to: `0x${string}` | null;
                    transactionIndex: number | null;
                    typeHex: `0x${string}` | null;
                    v: bigint;
                    value: bigint;
                    yParity: number;
                    accessList: import("viem").AccessList;
                    authorizationList?: undefined;
                    blobVersionedHashes?: undefined;
                    chainId: number;
                    type: "eip2930";
                    gasPrice: bigint;
                    maxFeePerBlobGas?: undefined;
                    maxFeePerGas?: undefined;
                    maxPriorityFeePerGas?: undefined;
                    isSystemTx?: undefined;
                    mint?: undefined;
                    sourceHash?: undefined;
                } | {
                    blockHash: `0x${string}` | null;
                    blockNumber: bigint | null;
                    from: `0x${string}`;
                    gas: bigint;
                    hash: `0x${string}`;
                    input: `0x${string}`;
                    nonce: number;
                    r: `0x${string}`;
                    s: `0x${string}`;
                    to: `0x${string}` | null;
                    transactionIndex: number | null;
                    typeHex: `0x${string}` | null;
                    v: bigint;
                    value: bigint;
                    yParity: number;
                    accessList: import("viem").AccessList;
                    authorizationList?: undefined;
                    blobVersionedHashes?: undefined;
                    chainId: number;
                    type: "eip1559";
                    gasPrice?: undefined;
                    maxFeePerBlobGas?: undefined;
                    maxFeePerGas: bigint;
                    maxPriorityFeePerGas: bigint;
                    isSystemTx?: undefined;
                    mint?: undefined;
                    sourceHash?: undefined;
                } | {
                    blockHash: `0x${string}` | null;
                    blockNumber: bigint | null;
                    from: `0x${string}`;
                    gas: bigint;
                    hash: `0x${string}`;
                    input: `0x${string}`;
                    nonce: number;
                    r: `0x${string}`;
                    s: `0x${string}`;
                    to: `0x${string}` | null;
                    transactionIndex: number | null;
                    typeHex: `0x${string}` | null;
                    v: bigint;
                    value: bigint;
                    yParity: number;
                    accessList: import("viem").AccessList;
                    authorizationList?: undefined;
                    blobVersionedHashes: readonly `0x${string}`[];
                    chainId: number;
                    type: "eip4844";
                    gasPrice?: undefined;
                    maxFeePerBlobGas: bigint;
                    maxFeePerGas: bigint;
                    maxPriorityFeePerGas: bigint;
                    isSystemTx?: undefined;
                    mint?: undefined;
                    sourceHash?: undefined;
                } | {
                    blockHash: `0x${string}` | null;
                    blockNumber: bigint | null;
                    from: `0x${string}`;
                    gas: bigint;
                    hash: `0x${string}`;
                    input: `0x${string}`;
                    nonce: number;
                    r: `0x${string}`;
                    s: `0x${string}`;
                    to: `0x${string}` | null;
                    transactionIndex: number | null;
                    typeHex: `0x${string}` | null;
                    v: bigint;
                    value: bigint;
                    yParity: number;
                    accessList: import("viem").AccessList;
                    authorizationList: import("viem/experimental").SignedAuthorizationList<number>;
                    blobVersionedHashes?: undefined;
                    chainId: number;
                    type: "eip7702";
                    gasPrice?: undefined;
                    maxFeePerBlobGas?: undefined;
                    maxFeePerGas: bigint;
                    maxPriorityFeePerGas: bigint;
                    isSystemTx?: undefined;
                    mint?: undefined;
                    sourceHash?: undefined;
                };
                type: "transaction";
            };
            readonly transactionReceipt: {
                exclude: [] | undefined;
                format: (args: import("viem/chains").OpStackRpcTransactionReceipt) => {
                    blobGasPrice?: bigint | undefined;
                    blobGasUsed?: bigint | undefined;
                    blockHash: `0x${string}`;
                    blockNumber: bigint;
                    contractAddress: `0x${string}` | null | undefined;
                    cumulativeGasUsed: bigint;
                    effectiveGasPrice: bigint;
                    from: `0x${string}`;
                    gasUsed: bigint;
                    logs: import("viem").Log<bigint, number, false, undefined, undefined, undefined, undefined>[];
                    logsBloom: `0x${string}`;
                    root?: `0x${string}` | undefined;
                    status: "success" | "reverted";
                    to: `0x${string}` | null;
                    transactionHash: `0x${string}`;
                    transactionIndex: number;
                    type: import("viem").TransactionType;
                    l1GasPrice: bigint | null;
                    l1GasUsed: bigint | null;
                    l1Fee: bigint | null;
                    l1FeeScalar: number | null;
                };
                type: "transactionReceipt";
            };
        };
        serializers: {
            readonly transaction: typeof import("viem/chains").serializeTransactionOpStack;
        };
    };
    optimism: {
        blockExplorers: {
            readonly default: {
                readonly name: "Optimism Explorer";
                readonly url: "https://optimistic.etherscan.io";
                readonly apiUrl: "https://api-optimistic.etherscan.io/api";
            };
        };
        contracts: {
            readonly disputeGameFactory: {
                readonly 1: {
                    readonly address: "0xe5965Ab5962eDc7477C8520243A95517CD252fA9";
                };
            };
            readonly l2OutputOracle: {
                readonly 1: {
                    readonly address: "0xdfe97868233d1aa22e815a266982f2cf17685a27";
                };
            };
            readonly multicall3: {
                readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                readonly blockCreated: 4286263;
            };
            readonly portal: {
                readonly 1: {
                    readonly address: "0xbEb5Fc579115071764c7423A4f12eDde41f106Ed";
                };
            };
            readonly l1StandardBridge: {
                readonly 1: {
                    readonly address: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1";
                };
            };
            readonly gasPriceOracle: {
                readonly address: "0x420000000000000000000000000000000000000F";
            };
            readonly l1Block: {
                readonly address: "0x4200000000000000000000000000000000000015";
            };
            readonly l2CrossDomainMessenger: {
                readonly address: "0x4200000000000000000000000000000000000007";
            };
            readonly l2Erc721Bridge: {
                readonly address: "0x4200000000000000000000000000000000000014";
            };
            readonly l2StandardBridge: {
                readonly address: "0x4200000000000000000000000000000000000010";
            };
            readonly l2ToL1MessagePasser: {
                readonly address: "0x4200000000000000000000000000000000000016";
            };
        };
        id: 10;
        name: "OP Mainnet";
        nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://mainnet.optimism.io"];
            };
        };
        sourceId: 1;
        testnet?: boolean | undefined;
        custom?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters: {
            readonly block: {
                exclude: [] | undefined;
                format: (args: import("viem/chains").OpStackRpcBlock<import("viem").BlockTag, boolean>) => {
                    baseFeePerGas: bigint | null;
                    blobGasUsed: bigint;
                    difficulty: bigint;
                    excessBlobGas: bigint;
                    extraData: `0x${string}`;
                    gasLimit: bigint;
                    gasUsed: bigint;
                    hash: `0x${string}` | null;
                    logsBloom: `0x${string}` | null;
                    miner: `0x${string}`;
                    mixHash: `0x${string}`;
                    nonce: `0x${string}` | null;
                    number: bigint | null;
                    parentBeaconBlockRoot?: `0x${string}` | undefined;
                    parentHash: `0x${string}`;
                    receiptsRoot: `0x${string}`;
                    sealFields: `0x${string}`[];
                    sha3Uncles: `0x${string}`;
                    size: bigint;
                    stateRoot: `0x${string}`;
                    timestamp: bigint;
                    totalDifficulty: bigint | null;
                    transactions: `0x${string}`[] | import("viem/chains").OpStackTransaction<boolean>[];
                    transactionsRoot: `0x${string}`;
                    uncles: `0x${string}`[];
                    withdrawals?: import("viem").Withdrawal[] | undefined;
                    withdrawalsRoot?: `0x${string}` | undefined;
                };
                type: "block";
            };
            readonly transaction: {
                exclude: [] | undefined;
                format: (args: import("viem/chains").OpStackRpcTransaction<boolean>) => {
                    blockHash: `0x${string}` | null;
                    blockNumber: bigint | null;
                    from: `0x${string}`;
                    gas: bigint;
                    hash: `0x${string}`;
                    input: `0x${string}`;
                    nonce: number;
                    r: `0x${string}`;
                    s: `0x${string}`;
                    to: `0x${string}` | null;
                    transactionIndex: number | null;
                    typeHex: `0x${string}` | null;
                    v: bigint;
                    value: bigint;
                    yParity: number;
                    gasPrice?: undefined;
                    maxFeePerBlobGas?: undefined;
                    maxFeePerGas: bigint;
                    maxPriorityFeePerGas: bigint;
                    isSystemTx?: boolean;
                    mint?: bigint | undefined;
                    sourceHash: `0x${string}`;
                    type: "deposit";
                } | {
                    r: `0x${string}`;
                    s: `0x${string}`;
                    v: bigint;
                    to: `0x${string}` | null;
                    from: `0x${string}`;
                    gas: bigint;
                    nonce: number;
                    value: bigint;
                    blockHash: `0x${string}` | null;
                    blockNumber: bigint | null;
                    hash: `0x${string}`;
                    input: `0x${string}`;
                    transactionIndex: number | null;
                    typeHex: `0x${string}` | null;
                    accessList?: undefined;
                    authorizationList?: undefined;
                    blobVersionedHashes?: undefined;
                    chainId?: number | undefined;
                    yParity?: undefined;
                    type: "legacy";
                    gasPrice: bigint;
                    maxFeePerBlobGas?: undefined;
                    maxFeePerGas?: undefined;
                    maxPriorityFeePerGas?: undefined;
                    isSystemTx?: undefined;
                    mint?: undefined;
                    sourceHash?: undefined;
                } | {
                    blockHash: `0x${string}` | null;
                    blockNumber: bigint | null;
                    from: `0x${string}`;
                    gas: bigint;
                    hash: `0x${string}`;
                    input: `0x${string}`;
                    nonce: number;
                    r: `0x${string}`;
                    s: `0x${string}`;
                    to: `0x${string}` | null;
                    transactionIndex: number | null;
                    typeHex: `0x${string}` | null;
                    v: bigint;
                    value: bigint;
                    yParity: number;
                    accessList: import("viem").AccessList;
                    authorizationList?: undefined;
                    blobVersionedHashes?: undefined;
                    chainId: number;
                    type: "eip2930";
                    gasPrice: bigint;
                    maxFeePerBlobGas?: undefined;
                    maxFeePerGas?: undefined;
                    maxPriorityFeePerGas?: undefined;
                    isSystemTx?: undefined;
                    mint?: undefined;
                    sourceHash?: undefined;
                } | {
                    blockHash: `0x${string}` | null;
                    blockNumber: bigint | null;
                    from: `0x${string}`;
                    gas: bigint;
                    hash: `0x${string}`;
                    input: `0x${string}`;
                    nonce: number;
                    r: `0x${string}`;
                    s: `0x${string}`;
                    to: `0x${string}` | null;
                    transactionIndex: number | null;
                    typeHex: `0x${string}` | null;
                    v: bigint;
                    value: bigint;
                    yParity: number;
                    accessList: import("viem").AccessList;
                    authorizationList?: undefined;
                    blobVersionedHashes?: undefined;
                    chainId: number;
                    type: "eip1559";
                    gasPrice?: undefined;
                    maxFeePerBlobGas?: undefined;
                    maxFeePerGas: bigint;
                    maxPriorityFeePerGas: bigint;
                    isSystemTx?: undefined;
                    mint?: undefined;
                    sourceHash?: undefined;
                } | {
                    blockHash: `0x${string}` | null;
                    blockNumber: bigint | null;
                    from: `0x${string}`;
                    gas: bigint;
                    hash: `0x${string}`;
                    input: `0x${string}`;
                    nonce: number;
                    r: `0x${string}`;
                    s: `0x${string}`;
                    to: `0x${string}` | null;
                    transactionIndex: number | null;
                    typeHex: `0x${string}` | null;
                    v: bigint;
                    value: bigint;
                    yParity: number;
                    accessList: import("viem").AccessList;
                    authorizationList?: undefined;
                    blobVersionedHashes: readonly `0x${string}`[];
                    chainId: number;
                    type: "eip4844";
                    gasPrice?: undefined;
                    maxFeePerBlobGas: bigint;
                    maxFeePerGas: bigint;
                    maxPriorityFeePerGas: bigint;
                    isSystemTx?: undefined;
                    mint?: undefined;
                    sourceHash?: undefined;
                } | {
                    blockHash: `0x${string}` | null;
                    blockNumber: bigint | null;
                    from: `0x${string}`;
                    gas: bigint;
                    hash: `0x${string}`;
                    input: `0x${string}`;
                    nonce: number;
                    r: `0x${string}`;
                    s: `0x${string}`;
                    to: `0x${string}` | null;
                    transactionIndex: number | null;
                    typeHex: `0x${string}` | null;
                    v: bigint;
                    value: bigint;
                    yParity: number;
                    accessList: import("viem").AccessList;
                    authorizationList: import("viem/experimental").SignedAuthorizationList<number>;
                    blobVersionedHashes?: undefined;
                    chainId: number;
                    type: "eip7702";
                    gasPrice?: undefined;
                    maxFeePerBlobGas?: undefined;
                    maxFeePerGas: bigint;
                    maxPriorityFeePerGas: bigint;
                    isSystemTx?: undefined;
                    mint?: undefined;
                    sourceHash?: undefined;
                };
                type: "transaction";
            };
            readonly transactionReceipt: {
                exclude: [] | undefined;
                format: (args: import("viem/chains").OpStackRpcTransactionReceipt) => {
                    blobGasPrice?: bigint | undefined;
                    blobGasUsed?: bigint | undefined;
                    blockHash: `0x${string}`;
                    blockNumber: bigint;
                    contractAddress: `0x${string}` | null | undefined;
                    cumulativeGasUsed: bigint;
                    effectiveGasPrice: bigint;
                    from: `0x${string}`;
                    gasUsed: bigint;
                    logs: import("viem").Log<bigint, number, false, undefined, undefined, undefined, undefined>[];
                    logsBloom: `0x${string}`;
                    root?: `0x${string}` | undefined;
                    status: "success" | "reverted";
                    to: `0x${string}` | null;
                    transactionHash: `0x${string}`;
                    transactionIndex: number;
                    type: import("viem").TransactionType;
                    l1GasPrice: bigint | null;
                    l1GasUsed: bigint | null;
                    l1Fee: bigint | null;
                    l1FeeScalar: number | null;
                };
                type: "transactionReceipt";
            };
        };
        serializers: {
            readonly transaction: typeof import("viem/chains").serializeTransactionOpStack;
        };
    };
    moonriver: {
        blockExplorers: {
            readonly default: {
                readonly name: "Moonscan";
                readonly url: "https://moonriver.moonscan.io";
                readonly apiUrl: "https://api-moonriver.moonscan.io/api";
            };
        };
        contracts: {
            readonly multicall3: {
                readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                readonly blockCreated: 1597904;
            };
        };
        id: 1285;
        name: "Moonriver";
        nativeCurrency: {
            readonly decimals: 18;
            readonly name: "MOVR";
            readonly symbol: "MOVR";
        };
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://moonriver.public.blastapi.io"];
                readonly webSocket: readonly ["wss://moonriver.public.blastapi.io"];
            };
        };
        sourceId?: number | undefined;
        testnet: false;
        custom?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable<bigint, number>> | undefined;
    };
    moonbeam: {
        blockExplorers: {
            readonly default: {
                readonly name: "Moonscan";
                readonly url: "https://moonscan.io";
                readonly apiUrl: "https://api-moonbeam.moonscan.io/api";
            };
        };
        contracts: {
            readonly multicall3: {
                readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
                readonly blockCreated: 609002;
            };
        };
        id: 1284;
        name: "Moonbeam";
        nativeCurrency: {
            readonly decimals: 18;
            readonly name: "GLMR";
            readonly symbol: "GLMR";
        };
        rpcUrls: {
            readonly default: {
                readonly http: readonly ["https://moonbeam.public.blastapi.io"];
                readonly webSocket: readonly ["wss://moonbeam.public.blastapi.io"];
            };
        };
        sourceId?: number | undefined;
        testnet: false;
        custom?: Record<string, unknown> | undefined;
        fees?: import("viem").ChainFees<undefined> | undefined;
        formatters?: undefined;
        serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable<bigint, number>> | undefined;
    };
};
type SupportedChains = Prettify<keyof typeof supportedChains>;
type BaseEnvironment = ReturnType<typeof createBaseEnvironment>;
type MoonbeamEnvironment = ReturnType<typeof createMoonbeamEnvironment>;
type MoonriverEnvironment = ReturnType<typeof createMoonriverEnvironment>;
type OptimismEnvironment = ReturnType<typeof createOptimismEnvironment>;
export type GetEnvironment<chain> = chain extends typeof base ? BaseEnvironment : chain extends typeof moonbeam ? MoonbeamEnvironment : chain extends typeof moonriver ? MoonriverEnvironment : chain extends typeof optimism ? OptimismEnvironment : undefined;
export declare const createEnvironment: <const chain extends Chain>(config: {
    chain: chain;
    rpcUrls?: string[];
    indexerUrl?: string;
}) => GetEnvironment<chain>;
export declare const publicEnvironments: {
    base: Environment;
    optimism: Environment;
    moonriver: Environment;
    moonbeam: Environment;
};
export type TokensType<chain> = chain extends typeof base ? typeof baseTokens : chain extends typeof moonbeam ? typeof moonbeamTokens : chain extends typeof moonriver ? typeof moonriverTokens : chain extends typeof optimism ? typeof optimismTokens : undefined;
export type MarketsType<chain> = chain extends typeof base ? typeof baseMarkets : chain extends typeof moonbeam ? typeof moonbeamMarkets : chain extends typeof moonriver ? typeof moonriverMarkets : chain extends typeof optimism ? typeof optimismMarkets : undefined;
export type VaultsType<chain> = chain extends typeof base ? typeof baseVaults : undefined;
export type MorphoMarketsType<chain> = chain extends typeof base ? typeof baseMorphoMarkets : undefined;
//# sourceMappingURL=index.d.ts.map