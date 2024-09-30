import { markets } from "./core-markets.js";
import { tokens } from "./tokens.js";
declare const createEnvironment: (rpcUrls?: string[], indexerUrl?: string) => import("../../types/config.js").Environment<{
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
export { createEnvironment, markets, tokens };
//# sourceMappingURL=environment.d.ts.map