export interface GovernanceTokenInfo {
    id: string;
    symbol: string;
    name: string;
    chainIds: Array<number>;
    testnet: boolean;
}
export interface GovernanceTokensType {
    [token: string]: GovernanceTokenInfo;
}
export declare const GovernanceTokensConfig: {
    WELL_TESTNET: {
        id: string;
        symbol: string;
        name: string;
        chainIds: number[];
        testnet: true;
    };
    WELL: {
        id: string;
        symbol: string;
        name: string;
        chainIds: number[];
        testnet: false;
    };
    MFAM: {
        id: string;
        symbol: string;
        name: string;
        chainIds: number[];
        testnet: false;
    };
};
export type GovernanceToken = keyof typeof GovernanceTokensConfig;
//# sourceMappingURL=governance.d.ts.map