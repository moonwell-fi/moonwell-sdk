import type { Environment } from "../../environments/index.js";
export declare const findMarketByAddress: (environment: Environment, address: `0x${string}`) => {
    marketKey: string;
    marketConfig: import("../../environments/types/config.js").MarketConfig<any>;
    marketToken: import("../../environments/index.js").TokenConfig;
    underlyingToken: import("../../environments/index.js").TokenConfig;
} | undefined;
export declare const findTokenByAddress: (environment: Environment, token: `0x${string}`) => import("../../environments/index.js").TokenConfig | undefined;
export declare const perDay: (value: number) => number;
export declare const calculateApy: (value: number) => number;
//# sourceMappingURL=index.d.ts.map