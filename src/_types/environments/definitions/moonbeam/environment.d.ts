import { moonbeam } from "viem/chains";
import { markets } from "./core-markets.js";
import { tokens } from "./tokens.js";
declare const createEnvironment: (rpcUrls?: string[], indexerUrl?: string) => import("../../types/config.js").Environment<{
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
        chainIds: 8453[];
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
export { moonbeam, createEnvironment, markets, tokens };
//# sourceMappingURL=environment.d.ts.map