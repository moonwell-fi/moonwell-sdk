import { describe, expect, test } from "vitest";
import {
  type LunarSharedLiquidityResponse,
  computeSharedLiquidityFromLunar,
} from "./common.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TARGET_ID =
  "0x1c21c59df9db44bf6f645d854ee710a8ca17b479451447e9f56758aee10a2fad";
const SOURCE_ID =
  "0x8793cf302b8ffd655ab97bd1c695dbd967807e8367a65cb2f4edaf1380ba1bda";
const SOURCE_ID_2 =
  "0xa066f3893b780833699043f824e5bb88b3df039886f524f62b9a1ac83cb7f1f0";

// USDC has 6 decimals — raw values are multiplied by 1e6
const USDC_SCALE = 1_000_000;

function raw(tokenUnits: number): string {
  return String(Math.round(tokenUnits * USDC_SCALE));
}

function usdcMarket(totalLiquidity: number): {
  totalLiquidity: string;
  loanToken: { address: string; decimals: number };
  collateralToken: { address: string; decimals: number };
} {
  return {
    totalLiquidity: String(totalLiquidity),
    loanToken: {
      address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
      decimals: 6,
    },
    collateralToken: {
      address: "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22",
      decimals: 18,
    },
  };
}

function makeVault(
  targetSupply: number,
  targetFlowCapIn: number,
  sourceMarkets: {
    marketId: string;
    supply: number;
    flowCapOut: number;
    supplyCap?: number;
    supplyCapEnabled?: boolean;
  }[],
): LunarSharedLiquidityResponse["vaults"][number] {
  return {
    address: "0xvault",
    name: "Test Vault",
    fee: "0",
    markets: [
      {
        marketId: TARGET_ID,
        flowCapIn: raw(targetFlowCapIn),
        flowCapOut: "0",
        supplyCap: "0",
        supplyCapEnabled: false,
        vaultSupplyShares: "0",
        vaultSupplyAssets: raw(targetSupply),
      },
      ...sourceMarkets.map((s) => ({
        marketId: s.marketId,
        flowCapIn: "0",
        flowCapOut: raw(s.flowCapOut),
        supplyCap: raw(s.supplyCap ?? 0),
        supplyCapEnabled: s.supplyCapEnabled ?? false,
        vaultSupplyShares: "0",
        vaultSupplyAssets: raw(s.supply),
      })),
    ],
  };
}

const emptyParamsMap = new Map<
  string,
  {
    oracle: string;
    irm: string;
    lltv: string;
    loanToken: { address: string; decimals: number };
    collateralToken: { address: string; decimals: number };
  }
>();

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("computeSharedLiquidityFromLunar", () => {
  test("basic: single vault contributes from one source market", () => {
    const data: LunarSharedLiquidityResponse = {
      vaults: [
        makeVault(35, 5000, [
          { marketId: SOURCE_ID, supply: 1000, flowCapOut: 500 },
        ]),
      ],
      markets: {
        [TARGET_ID.toLowerCase()]: usdcMarket(200),
        [SOURCE_ID.toLowerCase()]: usdcMarket(800),
      },
    };

    const [result] = computeSharedLiquidityFromLunar(
      data,
      [TARGET_ID],
      emptyParamsMap,
      8453,
    );

    // amount = min(liquidity=800, vaultSupply=1000, flowCapOut=500) = 500
    expect(result?.reallocatableLiquidityAssets.value).toBeCloseTo(500, 4);
    expect(result?.publicAllocatorSharedLiquidity).toHaveLength(1);
    expect(result?.publicAllocatorSharedLiquidity[0]?.assets).toBeCloseTo(
      500,
      4,
    );
  });

  test("flowCapIn on target caps the reallocatable amount", () => {
    const data: LunarSharedLiquidityResponse = {
      vaults: [
        makeVault(35, 100 /* flowCapIn=100 */, [
          { marketId: SOURCE_ID, supply: 1000, flowCapOut: 500 },
        ]),
      ],
      markets: {
        [TARGET_ID.toLowerCase()]: usdcMarket(200),
        [SOURCE_ID.toLowerCase()]: usdcMarket(800),
      },
    };

    const [result] = computeSharedLiquidityFromLunar(
      data,
      [TARGET_ID],
      emptyParamsMap,
      8453,
    );

    // maxIn = 100, even though source could provide 500
    expect(result?.reallocatableLiquidityAssets.value).toBeCloseTo(100, 4);
  });

  test("supplyCap constrains maxIn when supplyCapEnabled is true", () => {
    const data: LunarSharedLiquidityResponse = {
      vaults: [
        {
          address: "0xvault",
          name: "Test Vault",
          fee: "0",
          markets: [
            {
              marketId: TARGET_ID,
              flowCapIn: raw(5000),
              flowCapOut: "0",
              // supplyCap=135 USDC, vaultSupply=35 USDC → remainingCap=100
              supplyCap: raw(135),
              supplyCapEnabled: true,
              vaultSupplyShares: "0",
              vaultSupplyAssets: raw(35),
            },
            {
              marketId: SOURCE_ID,
              flowCapIn: "0",
              flowCapOut: raw(500),
              supplyCap: "0",
              supplyCapEnabled: false,
              vaultSupplyShares: "0",
              vaultSupplyAssets: raw(1000),
            },
          ],
        },
      ],
      markets: {
        [TARGET_ID.toLowerCase()]: usdcMarket(200),
        [SOURCE_ID.toLowerCase()]: usdcMarket(800),
      },
    };

    const [result] = computeSharedLiquidityFromLunar(
      data,
      [TARGET_ID],
      emptyParamsMap,
      8453,
    );

    // maxIn = min(flowCapIn=5000, remainingCap=100) = 100
    expect(result?.reallocatableLiquidityAssets.value).toBeCloseTo(100, 4);
  });

  test("marketRemainingLiquidity prevents double-counting across vaults", () => {
    // Two vaults both draw from the same source market (liquidity=600)
    const vaultA = makeVault(35, 500, [
      { marketId: SOURCE_ID, supply: 1000, flowCapOut: 500 },
    ]);
    const vaultB = makeVault(20, 500, [
      { marketId: SOURCE_ID, supply: 800, flowCapOut: 500 },
    ]);

    const data: LunarSharedLiquidityResponse = {
      vaults: [vaultA, vaultB],
      markets: {
        [TARGET_ID.toLowerCase()]: usdcMarket(200),
        [SOURCE_ID.toLowerCase()]: usdcMarket(600),
      },
    };

    const [result] = computeSharedLiquidityFromLunar(
      data,
      [TARGET_ID],
      emptyParamsMap,
      8453,
    );

    // Vault A: amount = min(600, 1000, 500) = 500 → remaining = 100
    // Vault B: amount = min(100, 800, 500) = 100
    // Total = 600, not 1000
    expect(result?.reallocatableLiquidityAssets.value).toBeCloseTo(600, 4);
    expect(result?.publicAllocatorSharedLiquidity).toHaveLength(2);
  });

  test("vault not present in target market is skipped", () => {
    const data: LunarSharedLiquidityResponse = {
      vaults: [
        {
          address: "0xvault",
          name: "Other Vault",
          fee: "0",
          // Only has SOURCE_ID, not TARGET_ID
          markets: [
            {
              marketId: SOURCE_ID,
              flowCapIn: raw(1000),
              flowCapOut: raw(500),
              supplyCap: "0",
              supplyCapEnabled: false,
              vaultSupplyShares: "0",
              vaultSupplyAssets: raw(500),
            },
          ],
        },
      ],
      markets: {
        [TARGET_ID.toLowerCase()]: usdcMarket(200),
        [SOURCE_ID.toLowerCase()]: usdcMarket(800),
      },
    };

    const [result] = computeSharedLiquidityFromLunar(
      data,
      [TARGET_ID],
      emptyParamsMap,
      8453,
    );

    expect(result?.reallocatableLiquidityAssets.value).toBe(0);
    expect(result?.publicAllocatorSharedLiquidity).toHaveLength(0);
  });

  test("vault with zero supply in target market is skipped", () => {
    const data: LunarSharedLiquidityResponse = {
      vaults: [
        makeVault(0 /* zero supply in target */, 5000, [
          { marketId: SOURCE_ID, supply: 1000, flowCapOut: 500 },
        ]),
      ],
      markets: {
        [TARGET_ID.toLowerCase()]: usdcMarket(200),
        [SOURCE_ID.toLowerCase()]: usdcMarket(800),
      },
    };

    const [result] = computeSharedLiquidityFromLunar(
      data,
      [TARGET_ID],
      emptyParamsMap,
      8453,
    );

    expect(result?.reallocatableLiquidityAssets.value).toBe(0);
  });

  test("flowCapIn of zero in target market is skipped", () => {
    const data: LunarSharedLiquidityResponse = {
      vaults: [
        makeVault(35, 0 /* flowCapIn=0 */, [
          { marketId: SOURCE_ID, supply: 1000, flowCapOut: 500 },
        ]),
      ],
      markets: {
        [TARGET_ID.toLowerCase()]: usdcMarket(200),
        [SOURCE_ID.toLowerCase()]: usdcMarket(800),
      },
    };

    const [result] = computeSharedLiquidityFromLunar(
      data,
      [TARGET_ID],
      emptyParamsMap,
      8453,
    );

    expect(result?.reallocatableLiquidityAssets.value).toBe(0);
  });

  test("source market with no live data is skipped", () => {
    const data: LunarSharedLiquidityResponse = {
      vaults: [
        makeVault(35, 5000, [
          { marketId: SOURCE_ID, supply: 1000, flowCapOut: 500 },
        ]),
      ],
      markets: {
        [TARGET_ID.toLowerCase()]: usdcMarket(200),
        // SOURCE_ID intentionally absent from markets
      },
    };

    const [result] = computeSharedLiquidityFromLunar(
      data,
      [TARGET_ID],
      emptyParamsMap,
      8453,
    );

    expect(result?.reallocatableLiquidityAssets.value).toBe(0);
  });

  test("source market with zero liquidity is skipped", () => {
    const data: LunarSharedLiquidityResponse = {
      vaults: [
        makeVault(35, 5000, [
          { marketId: SOURCE_ID, supply: 1000, flowCapOut: 500 },
        ]),
      ],
      markets: {
        [TARGET_ID.toLowerCase()]: usdcMarket(200),
        [SOURCE_ID.toLowerCase()]: usdcMarket(0), // zero liquidity
      },
    };

    const [result] = computeSharedLiquidityFromLunar(
      data,
      [TARGET_ID],
      emptyParamsMap,
      8453,
    );

    expect(result?.reallocatableLiquidityAssets.value).toBe(0);
  });

  test("multiple source markets are sorted by amount desc and maxIn is consumed greedily", () => {
    // Source A: amount=min(300, 300, 300)=300, Source B: amount=min(800, 800, 500)=500
    // maxIn=600 → B is processed first (500), then A uses remaining 100
    const data: LunarSharedLiquidityResponse = {
      vaults: [
        makeVault(35, 600 /* maxIn=600 */, [
          { marketId: SOURCE_ID, supply: 300, flowCapOut: 300 },
          { marketId: SOURCE_ID_2, supply: 800, flowCapOut: 500 },
        ]),
      ],
      markets: {
        [TARGET_ID.toLowerCase()]: usdcMarket(200),
        [SOURCE_ID.toLowerCase()]: usdcMarket(300),
        [SOURCE_ID_2.toLowerCase()]: usdcMarket(800),
      },
    };

    const [result] = computeSharedLiquidityFromLunar(
      data,
      [TARGET_ID],
      emptyParamsMap,
      8453,
    );

    expect(result?.reallocatableLiquidityAssets.value).toBeCloseTo(600, 4);
    expect(result?.publicAllocatorSharedLiquidity).toHaveLength(2);
    // Larger source (B=500) should appear first
    expect(result?.publicAllocatorSharedLiquidity[0]?.assets).toBeCloseTo(
      500,
      4,
    );
    expect(result?.publicAllocatorSharedLiquidity[1]?.assets).toBeCloseTo(
      100,
      4,
    );
  });

  test("totalLiquidity falls back to supply minus borrow when absent", () => {
    const data: LunarSharedLiquidityResponse = {
      vaults: [
        makeVault(35, 5000, [
          { marketId: SOURCE_ID, supply: 1000, flowCapOut: 500 },
        ]),
      ],
      markets: {
        [TARGET_ID.toLowerCase()]: usdcMarket(200),
        [SOURCE_ID.toLowerCase()]: {
          // No totalLiquidity — derive from supply - borrow
          totalSupplyAssets: "900",
          totalBorrowAssets: "200",
          loanToken: {
            address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
            decimals: 6,
          },
          collateralToken: {
            address: "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22",
            decimals: 18,
          },
        },
      },
    };

    const [result] = computeSharedLiquidityFromLunar(
      data,
      [TARGET_ID],
      emptyParamsMap,
      8453,
    );

    // liquidity = 900 - 200 = 700; amount = min(700, 1000, 500) = 500
    expect(result?.reallocatableLiquidityAssets.value).toBeCloseTo(500, 4);
  });

  test("decimals from marketParamsMap are used when live data is missing", () => {
    const data: LunarSharedLiquidityResponse = {
      vaults: [
        makeVault(35, 5000, [
          { marketId: SOURCE_ID, supply: 1000, flowCapOut: 500 },
        ]),
      ],
      markets: {
        // TARGET has no loanToken decimals in live data
        [TARGET_ID.toLowerCase()]: {
          totalLiquidity: "200",
          // loanToken absent — should fall back to marketParamsMap
        },
        [SOURCE_ID.toLowerCase()]: usdcMarket(800),
      },
    };

    const paramsMap = new Map([
      [
        TARGET_ID.toLowerCase(),
        {
          oracle: "0x0",
          irm: "0x0",
          lltv: "0",
          loanToken: {
            address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
            decimals: 6,
          },
          collateralToken: {
            address: "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22",
            decimals: 18,
          },
        },
      ],
    ]);

    const [result] = computeSharedLiquidityFromLunar(
      data,
      [TARGET_ID],
      paramsMap,
      8453,
    );

    expect(result?.reallocatableLiquidityAssets.value).toBeCloseTo(500, 4);
  });

  test("handles multiple target markets independently", () => {
    const TARGET_ID_B =
      "0xb3920b96dec75b6a1144b71f963f30236fb200f3e33e93c2e9c0d222c1fa53c2";

    const data: LunarSharedLiquidityResponse = {
      vaults: [
        makeVault(35, 5000, [
          { marketId: SOURCE_ID, supply: 1000, flowCapOut: 500 },
        ]),
      ],
      markets: {
        [TARGET_ID.toLowerCase()]: usdcMarket(200),
        [TARGET_ID_B.toLowerCase()]: usdcMarket(300),
        [SOURCE_ID.toLowerCase()]: usdcMarket(800),
      },
    };

    const results = computeSharedLiquidityFromLunar(
      data,
      [TARGET_ID, TARGET_ID_B],
      emptyParamsMap,
      8453,
    );

    expect(results).toHaveLength(2);
    // First target gets computed normally
    expect(results[0]?.marketId).toBe(TARGET_ID.toLowerCase());
    // Second target has no vault pointing at it
    expect(results[1]?.marketId).toBe(TARGET_ID_B.toLowerCase());
    expect(results[1]?.reallocatableLiquidityAssets.value).toBe(0);
  });

  test("allocationMarket is populated from marketParamsMap when available", () => {
    const paramsMap = new Map([
      [
        SOURCE_ID.toLowerCase(),
        {
          oracle: "0xoracle",
          irm: "0xirm",
          lltv: "860000000000000000",
          loanToken: {
            address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
            decimals: 6,
          },
          collateralToken: {
            address: "0x4200000000000000000000000000000000000006",
            decimals: 18,
          },
        },
      ],
    ]);

    const data: LunarSharedLiquidityResponse = {
      vaults: [
        makeVault(35, 5000, [
          { marketId: SOURCE_ID, supply: 1000, flowCapOut: 500 },
        ]),
      ],
      markets: {
        [TARGET_ID.toLowerCase()]: usdcMarket(200),
        [SOURCE_ID.toLowerCase()]: usdcMarket(800),
      },
    };

    const [result] = computeSharedLiquidityFromLunar(
      data,
      [TARGET_ID],
      paramsMap,
      8453,
    );

    const [entry] = result?.publicAllocatorSharedLiquidity ?? [];
    expect(entry?.allocationMarket).toBeDefined();
    expect(entry?.allocationMarket?.uniqueKey).toBe(SOURCE_ID);
    expect(entry?.allocationMarket?.oracleAddress).toBe("0xoracle");
  });

  test("allocationMarket is undefined when source not in marketParamsMap", () => {
    const data: LunarSharedLiquidityResponse = {
      vaults: [
        makeVault(35, 5000, [
          { marketId: SOURCE_ID, supply: 1000, flowCapOut: 500 },
        ]),
      ],
      markets: {
        [TARGET_ID.toLowerCase()]: usdcMarket(200),
        [SOURCE_ID.toLowerCase()]: usdcMarket(800),
      },
    };

    const [result] = computeSharedLiquidityFromLunar(
      data,
      [TARGET_ID],
      emptyParamsMap,
      8453,
    );

    const [entry] = result?.publicAllocatorSharedLiquidity ?? [];
    expect(entry?.allocationMarket).toBeUndefined();
  });
});
