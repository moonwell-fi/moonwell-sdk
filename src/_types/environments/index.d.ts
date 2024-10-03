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
    base: Environment<{
        ETH: {
            address: "0x0000000000000000000000000000000000000000";
            decimals: 18;
            name: "Ethereum";
            symbol: "ETH";
        };
        WETH: {
            address: "0x4200000000000000000000000000000000000006";
            decimals: 18;
            name: "Wrapped Ethereum";
            symbol: "WETH";
        };
        USDC: {
            address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
            decimals: 6;
            name: "USD Coin";
            symbol: "USDC";
        };
        MOONWELL_USDC: {
            address: "0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22";
            decimals: 8;
            name: "Moonwell USDC";
            symbol: "USDC";
        };
        MOONWELL_ETH: {
            address: "0x628ff693426583D9a7FB391E54366292F509D457";
            decimals: 8;
            name: "Moonwell ETH";
            symbol: "ETH";
        };
        cbETH: {
            address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22";
            decimals: 18;
            name: "Coinbase Staked Ethereum";
            symbol: "cbETH";
        };
        MOONWELL_cbETH: {
            address: "0x3bf93770f2d4a794c3d9EBEfBAeBAE2a8f09A5E5";
            decimals: 8;
            name: "Moonwell cbETH";
            symbol: "cbETH";
        };
        wstETH: {
            address: "0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452";
            decimals: 18;
            name: "Lido Staked Ethereum";
            symbol: "wstETH";
        };
        MOONWELL_wstETH: {
            address: "0x627Fe393Bc6EdDA28e99AE648fD6fF362514304b";
            decimals: 8;
            name: "Moonwell wstETH";
            symbol: "wstETH";
        };
        rETH: {
            address: "0xb6fe221fe9eef5aba221c348ba20a1bf5e73624c";
            decimals: 18;
            name: "Rocket Pool Staked Ethereum";
            symbol: "rETH";
        };
        MOONWELL_rETH: {
            address: "0xCB1DaCd30638ae38F2B94eA64F066045B7D45f44";
            decimals: 8;
            name: "Moonwell rETH";
            symbol: "rETH";
        };
        weETH: {
            address: "0x04c0599ae5a44757c0af6f9ec3b93da8976c150a";
            decimals: 18;
            name: "EtherFi Restaked Ethereum";
            symbol: "weETH";
        };
        MOONWELL_weETH: {
            address: "0xb8051464C8c92209C92F3a4CD9C73746C4c3CFb3";
            decimals: 8;
            name: "Moonwell weETH";
            symbol: "weETH";
        };
        cbBTC: {
            address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf";
            decimals: 8;
            name: "Coinbase Bitcoin";
            symbol: "cbBTC";
        };
        MOONWELL_cbBTC: {
            address: "0xF877ACaFA28c19b96727966690b2f44d35aD5976";
            decimals: 8;
            name: "Moonwell cbBTC";
            symbol: "cbBTC";
        };
        AERO: {
            address: "0x940181a94A35A4569E4529A3CDfB74e38FD98631";
            decimals: 18;
            name: "Aerodrome Finance";
            symbol: "AERO";
        };
        MOONWELL_AERO: {
            address: "0x73902f619CEB9B31FD8EFecf435CbDf89E369Ba6";
            decimals: 8;
            name: "Moonwell AERO";
            symbol: "AERO";
        };
        DAI: {
            address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";
            decimals: 18;
            name: "DAI Stablecoin";
            symbol: "DAI";
        };
        MOONWELL_DAI: {
            address: "0x73b06D8d18De422E269645eaCe15400DE7462417";
            decimals: 8;
            name: "Moonwell DAI";
            symbol: "DAI";
        };
        USDbC: {
            address: "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca";
            decimals: 6;
            name: "USD Coin";
            symbol: "USDbC";
        };
        MOONWELL_USDbC: {
            address: "0x703843C3379b52F9FF486c9f5892218d2a065cC8";
            decimals: 8;
            name: "Moonwell USDbC";
            symbol: "USDbC";
        };
        mwETH: {
            address: "0xa0E430870c4604CcfC7B38Ca7845B1FF653D0ff1";
            decimals: 18;
            name: "Moonwell Flagship ETH";
            symbol: "mwETH";
        };
        mwUSDC: {
            address: "0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca";
            decimals: 18;
            name: "Moonwell Flagship USDC";
            symbol: "mwUSDC";
        };
        WELL: {
            address: "0xA88594D404727625A9437C3f886C7643872296AE";
            decimals: 18;
            name: "WELL";
            symbol: "WELL";
        };
        stkWELL: {
            address: "0xe66E3A37C3274Ac24FE8590f7D84A2427194DC17";
            decimals: 18;
            name: "stkWELL";
            symbol: "stkWELL";
        };
    }, {
        MOONWELL_USDC: {
            marketToken: "MOONWELL_USDC";
            underlyingToken: "USDC";
        };
        MOONWELL_ETH: {
            marketToken: "MOONWELL_ETH";
            underlyingToken: "ETH";
        };
        MOONWELL_cbETH: {
            marketToken: "MOONWELL_cbETH";
            underlyingToken: "cbETH";
        };
        MOONWELL_wstETH: {
            marketToken: "MOONWELL_wstETH";
            underlyingToken: "wstETH";
        };
        MOONWELL_rETH: {
            marketToken: "MOONWELL_rETH";
            underlyingToken: "rETH";
        };
        MOONWELL_weETH: {
            marketToken: "MOONWELL_weETH";
            underlyingToken: "weETH";
        };
        MOONWELL_cbBTC: {
            marketToken: "MOONWELL_cbBTC";
            underlyingToken: "cbBTC";
        };
        MOONWELL_AERO: {
            marketToken: "MOONWELL_AERO";
            underlyingToken: "AERO";
        };
        MOONWELL_DAI: {
            marketToken: "MOONWELL_DAI";
            underlyingToken: "DAI";
        };
        MOONWELL_USDbC: {
            marketToken: "MOONWELL_USDbC";
            underlyingToken: "USDbC";
        };
    }, {
        mwETH: {
            underlyingToken: "ETH";
            vaultToken: "mwETH";
        };
        mwUSDC: {
            underlyingToken: "USDC";
            vaultToken: "mwUSDC";
        };
    }, {
        stakingToken: "stkWELL";
        wrappedNativeToken: "WETH";
        governanceToken: "WELL";
        comptroller: "0xfBb21d0380beE3312B33c4353c8936a0F13EF26C";
        views: "0x821Ff3a967b39bcbE8A018a9b1563EAf878bad39";
        multiRewardDistributor: "0xe9005b078701e2A0948D2EaC43010D35870Ad9d2";
        oracle: "0xEC942bE8A8114bFD0396A5052c36027f2cA6a9d0";
        router: "0x70778cfcFC475c7eA0f24cC625Baf6EaE475D0c9";
        temporalGovernor: "0x8b621804a7637b781e2BbD58e256a591F2dF7d51";
        voteCollector: "0xe0278B32c627FF6fFbbe7de6A18Ade145603e949";
        morphoBlue: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb";
        morphoBundler: "0x23055618898e202386e6c13955a58D3C68200BFB";
        morphoPublicAllocator: "0xA090dD1a701408Df1d4d0B85b716c87565f90467";
        morphoViews: "0xc72fCC9793a10b9c363EeaAcaAbe422E0672B42B";
    }, {
        governance: {
            token: "WELL";
            chainIds: never[];
        };
        wormhole: {
            chainId: number;
            tokenBridge: {
                address: "0x8d2de8d2f73F1F4cAB472AC9A881C9b123C79627";
            };
        };
        socket: {
            gateway: {
                address: "0x3a23F943181408EAC424116Af7b7790c94Cb97a5";
            };
        };
        xWELL: {
            bridgeAdapter: {
                address: "0x734AbBCe07679C9A6B4Fe3bC16325e028fA6DbB7";
            };
        };
    }>;
    moonbeam: Environment<{
        GLMR: {
            address: "0x0000000000000000000000000000000000000000";
            decimals: 18;
            name: "Moonbeam";
            symbol: "GLMR";
        };
        WGLMR: {
            address: "0xAcc15dC74880C9944775448304B263D191c6077F";
            decimals: 18;
            name: "Wrapped GLMR";
            symbol: "WGLMR";
        };
        MOONWELL_GLMR: {
            address: "0x091608f4e4a15335145be0A279483C0f8E4c7955";
            decimals: 8;
            name: "Moonwell GLMR";
            symbol: "GLMR";
        };
        xcDOT: {
            address: "0xffffffff1fcacbd218edc0eba20fc2308c778080";
            decimals: 10;
            name: "Polkadot";
            symbol: "xcDOT";
        };
        MOONWELL_xcDOT: {
            address: "0xD22Da948c0aB3A27f5570b604f3ADef5F68211C3";
            decimals: 8;
            name: "Moonwell xcDOT";
            symbol: "xcDOT";
        };
        FRAX: {
            address: "0x322e86852e492a7ee17f28a78c663da38fb33bfb";
            decimals: 18;
            name: "Frax";
            symbol: "FRAX";
        };
        MOONWELL_FRAX: {
            address: "0x1C55649f73CDA2f72CEf3DD6C5CA3d49EFcF484C";
            decimals: 8;
            name: "Moonwell FRAX";
            symbol: "FRAX";
        };
        xcUSDC: {
            address: "0xFFfffffF7D2B0B761Af01Ca8e25242976ac0aD7D";
            decimals: 6;
            name: "USD Coin";
            symbol: "xcUSDC";
        };
        MOONWELL_xcUSDC: {
            address: "0x22b1a40e3178fe7C7109eFCc247C5bB2B34ABe32";
            decimals: 8;
            name: "Moonwell xcUSDC";
            symbol: "xcUSDC";
        };
        xcUSDT: {
            address: "0xFFFFFFfFea09FB06d082fd1275CD48b191cbCD1d";
            decimals: 6;
            name: "Tether";
            symbol: "xcUSDT";
        };
        MOONWELL_xcUSDT: {
            address: "0x42A96C0681B74838eC525AdbD13c37f66388f289";
            decimals: 8;
            name: "Moonwell xcUSDT";
            symbol: "xcUSDT";
        };
        ETH: {
            address: "0x30d2a9f5fdf90ace8c17952cbb4ee48a55d916a7";
            decimals: 18;
            name: "Ethereum";
            symbol: "ETH";
        };
        MOONWELL_ETH: {
            address: "0xc3090f41Eb54A7f18587FD6651d4D3ab477b07a4";
            decimals: 8;
            name: "Moonwell ETH";
            symbol: "ETH";
        };
        BTC: {
            address: "0x1DC78Acda13a8BC4408B207c9E48CDBc096D95e0";
            decimals: 8;
            name: "Bitcoin";
            symbol: "BTC";
        };
        MOONWELL_BTC: {
            address: "0x24A9d8f1f350d59cB0368D3d52A77dB29c833D1D";
            decimals: 8;
            name: "Moonwell BTC";
            symbol: "BTC";
        };
        USDC: {
            address: "0x8f552a71efe5eefc207bf75485b356a0b3f01ec9";
            decimals: 6;
            name: "USD Coin";
            symbol: "USDC";
        };
        MOONWELL_USDC: {
            address: "0x02e9081DfadD37A852F9a73C4d7d69e615E61334";
            decimals: 8;
            name: "Moonwell USDC";
            symbol: "USDC";
        };
        BUSD: {
            address: "0x692c57641fc054c2ad6551ccc6566eba599de1ba";
            decimals: 18;
            name: "BUSD Coin";
            symbol: "BUSD";
        };
        MOONWELL_BUSD: {
            address: "0x298f2E346b82D69a473BF25f329BDF869e17dEc8";
            decimals: 8;
            name: "Moonwell BUSD";
            symbol: "BUSD";
        };
        WELL: {
            address: "0xA88594D404727625A9437C3f886C7643872296AE";
            decimals: 18;
            name: "WELL";
            symbol: "WELL";
        };
        stkWELL: {
            address: "0x8568A675384d761f36eC269D695d6Ce4423cfaB1";
            decimals: 18;
            name: "stkWELL";
            symbol: "stkWELL";
        };
    }, {
        MOONWELL_GLMR: {
            marketToken: "MOONWELL_GLMR";
            underlyingToken: "GLMR";
        };
        MOONWELL_xcDOT: {
            marketToken: "MOONWELL_xcDOT";
            underlyingToken: "xcDOT";
        };
        MOONWELL_FRAX: {
            marketToken: "MOONWELL_FRAX";
            underlyingToken: "FRAX";
        };
        MOONWELL_xcUSDC: {
            marketToken: "MOONWELL_xcUSDC";
            underlyingToken: "xcUSDC";
        };
        MOONWELL_xcUSDT: {
            marketToken: "MOONWELL_xcUSDT";
            underlyingToken: "xcUSDT";
        };
        MOONWELL_ETH: {
            marketToken: "MOONWELL_ETH";
            underlyingToken: "ETH";
        };
        MOONWELL_BTC: {
            marketToken: "MOONWELL_BTC";
            underlyingToken: "BTC";
        };
        MOONWELL_USDC: {
            marketToken: "MOONWELL_USDC";
            underlyingToken: "USDC";
        };
        MOONWELL_BUSD: {
            marketToken: "MOONWELL_BUSD";
            underlyingToken: "BUSD";
        };
    }, unknown, {
        governanceToken: "WELL";
        stakingToken: "stkWELL";
        wrappedNativeToken: "WGLMR";
        comptroller: "0x8E00D5e02E65A19337Cdba98bbA9F84d4186a180";
        views: "0xe76C8B8706faC85a8Fbdcac3C42e3E7823c73994";
        oracle: "0xED301cd3EB27217BDB05C4E9B820a8A3c8B665f9";
        governor: "0xfc4DFB17101A12C5CEc5eeDd8E92B5b16557666d";
        multichainGovernor: "0x9A8464C4C11CeA17e191653Deb7CdC1bE30F1Af4";
    }, {
        governance: {
            token: "WELL";
            chainIds: (8453 | 10)[];
            proposalIdOffset: number;
            snapshotEnsName: string;
        };
        wormhole: {
            chainId: number;
            tokenBridge: {
                address: "0xB1731c586ca89a23809861c6103F0b96B3F57D92";
            };
        };
        socket: {
            gateway: {
                address: "0x3a23F943181408EAC424116Af7b7790c94Cb97a5";
            };
        };
        xWELL: {
            bridgeAdapter: {
                address: "0xb84543e036054E2cD5394A9D99fa701Eef666df4";
            };
        };
    }>;
    moonriver: Environment<{
        MOVR: {
            address: "0x0000000000000000000000000000000000000000";
            decimals: 18;
            name: "MOVR";
            symbol: "MOVR";
        };
        WMOVR: {
            address: "0x98878B06940aE243284CA214f92Bb71a2b032B8A";
            decimals: 18;
            name: "Wrapped MOVR";
            symbol: "MOVR";
        };
        MOONWELL_MOVR: {
            address: "0x6a1A771C7826596652daDC9145fEAaE62b1cd07f";
            decimals: 8;
            name: "Moonwell MOVR";
            symbol: "MOVR";
        };
        xcKSM: {
            address: "0xffffffff1fcacbd218edc0eba20fc2308c778080";
            decimals: 12;
            name: "Kusama";
            symbol: "xcKSM";
        };
        MOONWELL_xcKSM: {
            address: "0xa0D116513Bd0B8f3F14e6Ea41556c6Ec34688e0f";
            decimals: 8;
            name: "Moonwell xcKSM";
            symbol: "xcKSM";
        };
        FRAX: {
            address: "0x1A93B23281CC1CDE4C4741353F3064709A16197d";
            decimals: 18;
            name: "Frax";
            symbol: "FRAX";
        };
        MOONWELL_FRAX: {
            address: "0x93Ef8B7c6171BaB1C0A51092B2c9da8dc2ba0e9D";
            decimals: 8;
            name: "Moonwell FRAX";
            symbol: "FRAX";
        };
        BTC: {
            address: "0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8";
            decimals: 8;
            name: "Bitcoin";
            symbol: "BTC";
        };
        MOONWELL_BTC: {
            address: "0x6E745367F4Ad2b3da7339aee65dC85d416614D90";
            decimals: 8;
            name: "Moonwell BTC";
            symbol: "BTC";
        };
        USDC: {
            address: "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D";
            decimals: 6;
            name: "USD Coin";
            symbol: "USDC";
        };
        MOONWELL_USDC: {
            address: "0xd0670AEe3698F66e2D4dAf071EB9c690d978BFA8";
            decimals: 8;
            name: "Moonwell USDC";
            symbol: "USDC";
        };
        ETH: {
            address: "0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C";
            decimals: 18;
            name: "Ethereum";
            symbol: "ETH";
        };
        MOONWELL_ETH: {
            address: "0x6503D905338e2ebB550c9eC39Ced525b612E77aE";
            decimals: 8;
            name: "Moonwell ETH";
            symbol: "ETH";
        };
        USDT: {
            address: "0xB44a9B6905aF7c801311e8F4E76932ee959c663C";
            decimals: 6;
            name: "Tether";
            symbol: "USDT";
        };
        MOONWELL_USDT: {
            address: "0x36918B66F9A3eC7a59d0007D8458DB17bDffBF21";
            decimals: 8;
            name: "Moonwell USDT";
            symbol: "USDT";
        };
        MFAM: {
            address: "0xBb8d88bcD9749636BC4D2bE22aaC4Bb3B01A58F1";
            decimals: 18;
            name: "MFAM";
            symbol: "MFAM";
        };
        stkMFAM: {
            address: "0xCd76e63f3AbFA864c53b4B98F57c1aA6539FDa3a";
            decimals: 18;
            name: "stkMFAM";
            symbol: "stkMFAM";
        };
    }, {
        MOONWELL_MOVR: {
            marketToken: "MOONWELL_MOVR";
            underlyingToken: "MOVR";
        };
        MOONWELL_xcKSM: {
            marketToken: "MOONWELL_xcKSM";
            underlyingToken: "xcKSM";
        };
        MOONWELL_FRAX: {
            marketToken: "MOONWELL_FRAX";
            underlyingToken: "FRAX";
        };
        MOONWELL_BTC: {
            marketToken: "MOONWELL_BTC";
            underlyingToken: "BTC";
        };
        MOONWELL_USDC: {
            marketToken: "MOONWELL_USDC";
            underlyingToken: "USDC";
        };
        MOONWELL_ETH: {
            marketToken: "MOONWELL_ETH";
            underlyingToken: "ETH";
        };
        MOONWELL_USDT: {
            marketToken: "MOONWELL_USDT";
            underlyingToken: "USDT";
        };
    }, unknown, {
        governanceToken: "MFAM";
        stakingToken: "stkMFAM";
        wrappedNativeToken: "WMOVR";
        comptroller: "0x0b7a0EAA884849c6Af7a129e899536dDDcA4905E";
        views: "0xb4104C02BBf4E9be85AAa41a62974E4e28D59A33";
        oracle: "0x892bE716Dcf0A6199677F355f45ba8CC123BAF60";
        governor: "0x2BE2e230e89c59c8E20E633C524AD2De246e7370";
    }, {
        governance: {
            token: "MFAM";
            chainIds: never[];
            snapshotEnsName: string;
        };
    }>;
    optimism: Environment<{
        USDC: {
            address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";
            decimals: 6;
            name: "USD Coin";
            symbol: "USDC";
        };
        MOONWELL_USDC: {
            address: "0x8E08617b0d66359D73Aa11E11017834C29155525";
            decimals: 8;
            name: "Moonwell USDC";
            symbol: "USDC";
        };
        ETH: {
            address: "0x0000000000000000000000000000000000000000";
            decimals: 18;
            name: "Ethereum";
            symbol: "ETH";
        };
        WETH: {
            address: "0x4200000000000000000000000000000000000006";
            decimals: 18;
            name: "Wrapped Ethereum";
            symbol: "WETH";
        };
        MOONWELL_ETH: {
            address: "0xb4104C02BBf4E9be85AAa41a62974E4e28D59A33";
            decimals: 8;
            name: "Moonwell ETH";
            symbol: "ETH";
        };
        cbETH: {
            address: "0xadDb6A0412DE1BA0F936DCaeb8Aaa24578dcF3B2";
            decimals: 18;
            name: "Coinbase Staked Ethereum";
            symbol: "cbETH";
        };
        MOONWELL_cbETH: {
            address: "0x95C84F369bd0251ca903052600A3C96838D78bA1";
            decimals: 8;
            name: "Moonwell cbETH";
            symbol: "cbETH";
        };
        wstETH: {
            address: "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb";
            decimals: 18;
            name: "Lido Staked Ethereum";
            symbol: "wstETH";
        };
        MOONWELL_wstETH: {
            address: "0xbb3b1aB66eFB43B10923b87460c0106643B83f9d";
            decimals: 8;
            name: "Moonwell wstETH";
            symbol: "wstETH";
        };
        rETH: {
            address: "0x9Bcef72be871e61ED4fBbc7630889beE758eb81D";
            decimals: 18;
            name: "Rocket Pool Staked Ethereum";
            symbol: "rETH";
        };
        MOONWELL_rETH: {
            address: "0x4c2E35E3eC4A0C82849637BC04A4609Dbe53d321";
            decimals: 8;
            name: "Moonwell rETH";
            symbol: "rETH";
        };
        weETH: {
            address: "0x5A7fACB970D094B6C7FF1df0eA68D99E6e73CBFF";
            decimals: 18;
            name: "EtherFi Restaked Ethereum";
            symbol: "weETH";
        };
        MOONWELL_weETH: {
            address: "0xb8051464C8c92209C92F3a4CD9C73746C4c3CFb3";
            decimals: 8;
            name: "Moonwell weETH";
            symbol: "weETH";
        };
        WBTC: {
            address: "0x68f180fcCe6836688e9084f035309E29Bf0A2095";
            decimals: 8;
            name: "Wrapped Bitcoin";
            symbol: "WBTC";
        };
        MOONWELL_WBTC: {
            address: "0x6e6CA598A06E609c913551B729a228B023f06fDB";
            decimals: 8;
            name: "Moonwell WBTC";
            symbol: "WBTC";
        };
        USDT: {
            address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58";
            decimals: 6;
            name: "Tether";
            symbol: "USDT";
        };
        MOONWELL_USDT: {
            address: "0xa3A53899EE8f9f6E963437C5B3f805FEc538BF84";
            decimals: 8;
            name: "Moonwell USDT";
            symbol: "USDT";
        };
        VELO: {
            address: "0x9560e827af36c94d2ac33a39bce1fe78631088db";
            decimals: 18;
            name: "Velodrome Finance";
            symbol: "VELO";
        };
        MOONWELL_VELO: {
            address: "0x866b838b97Ee43F2c818B3cb5Cc77A0dc22003Fc";
            decimals: 8;
            name: "Moonwell VELO";
            symbol: "VELO";
        };
        DAI: {
            address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1";
            decimals: 18;
            name: "DAI Stablecoin";
            symbol: "DAI";
        };
        MOONWELL_DAI: {
            address: "0x3FE782C2Fe7668C2F1Eb313ACf3022a31feaD6B2";
            decimals: 8;
            name: "Moonwell DAI";
            symbol: "DAI";
        };
        OP: {
            address: "0x4200000000000000000000000000000000000042";
            decimals: 18;
            name: "Optimism";
            symbol: "OP";
        };
        MOONWELL_OP: {
            address: "0x9fc345a20541Bf8773988515c5950eD69aF01847";
            decimals: 8;
            name: "Moonwell OP";
            symbol: "OP";
        };
        WELL: {
            address: "0xA88594D404727625A9437C3f886C7643872296AE";
            decimals: 18;
            name: "WELL";
            symbol: "WELL";
        };
        stkWELL: {
            address: "0xfB26A4947A38cb53e2D083c6490060CCCE7438c5";
            decimals: 18;
            name: "stkWELL";
            symbol: "stkWELL";
        };
    }, {
        MOONWELL_USDC: {
            marketToken: "MOONWELL_USDC";
            underlyingToken: "USDC";
        };
        MOONWELL_ETH: {
            marketToken: "MOONWELL_ETH";
            underlyingToken: "ETH";
        };
        MOONWELL_cbETH: {
            marketToken: "MOONWELL_cbETH";
            underlyingToken: "cbETH";
        };
        MOONWELL_wstETH: {
            marketToken: "MOONWELL_wstETH";
            underlyingToken: "wstETH";
        };
        MOONWELL_rETH: {
            marketToken: "MOONWELL_rETH";
            underlyingToken: "rETH";
        };
        MOONWELL_weETH: {
            marketToken: "MOONWELL_weETH";
            underlyingToken: "weETH";
        };
        MOONWELL_WBTC: {
            marketToken: "MOONWELL_WBTC";
            underlyingToken: "WBTC";
        };
        MOONWELL_USDT: {
            marketToken: "MOONWELL_USDT";
            underlyingToken: "USDT";
        };
        MOONWELL_VELO: {
            marketToken: "MOONWELL_VELO";
            underlyingToken: "VELO";
        };
        MOONWELL_DAI: {
            marketToken: "MOONWELL_DAI";
            underlyingToken: "DAI";
        };
        MOONWELL_OP: {
            marketToken: "MOONWELL_OP";
            underlyingToken: "OP";
        };
    }, unknown, {
        governanceToken: "WELL";
        stakingToken: "stkWELL";
        wrappedNativeToken: "WETH";
        comptroller: "0xCa889f40aae37FFf165BccF69aeF1E82b5C511B9";
        views: "0xD6C66868f937f00604d0FB860241970D6CC2CBfE";
        multiRewardDistributor: "0xF9524bfa18C19C3E605FbfE8DFd05C6e967574Aa";
        oracle: "0x2f1490bD6aD10C9CE42a2829afa13EAc0b746dcf";
        router: "0xc4Ab8C031717d7ecCCD653BE898e0f92410E11dC";
        temporalGovernor: "0x17C9ba3fDa7EC71CcfD75f978Ef31E21927aFF3d";
        voteCollector: "0x3C968481BE3ba1a99fed5f73dB2Ff51151037738";
    }, {
        governance: {
            token: "WELL";
            chainIds: never[];
        };
    }>;
};
export type TokensType<environment> = environment extends BaseEnvironment ? typeof baseTokens : environment extends MoonbeamEnvironment ? typeof moonbeamTokens : environment extends MoonriverEnvironment ? typeof moonriverTokens : environment extends OptimismEnvironment ? typeof optimismTokens : undefined;
export type MarketsType<environment> = environment extends BaseEnvironment ? typeof baseMarkets : environment extends MoonbeamEnvironment ? typeof moonbeamMarkets : environment extends MoonriverEnvironment ? typeof moonriverMarkets : environment extends OptimismEnvironment ? typeof optimismMarkets : undefined;
export type VaultsType<environment> = environment extends BaseEnvironment ? typeof baseVaults : undefined;
export type MorphoMarketsType<environment> = environment extends BaseEnvironment ? typeof baseMorphoMarkets : undefined;
//# sourceMappingURL=index.d.ts.map