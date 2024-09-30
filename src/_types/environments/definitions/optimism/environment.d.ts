import { markets } from "./core-markets.js";
import { tokens } from "./tokens.js";
declare const createEnvironment: (rpcUrls?: string[], indexerUrl?: string) => import("../../types/config.js").Environment<{
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
    views: "0x821Ff3a967b39bcbE8A018a9b1563EAf878bad39";
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
export { createEnvironment, markets, tokens };
//# sourceMappingURL=environment.d.ts.map