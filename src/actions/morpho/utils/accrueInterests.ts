import { toSharesDown, wMulDown, wTaylorCompounded } from "./math.js";

export const accrueInterests = (
  lastBlockTimestamp: bigint,
  marketState: {
    totalSupplyAssets: bigint;
    totalSupplyShares: bigint;
    totalBorrowAssets: bigint;
    totalBorrowShares: bigint;
    lastUpdate: bigint;
    fee: bigint;
  },
  borrowRate: bigint,
) => {
  const elapsed = BigInt(lastBlockTimestamp) - BigInt(marketState.lastUpdate);

  // Early return if no time has elapsed since the last update
  if (elapsed === 0n || marketState.totalBorrowAssets === 0n) {
    return marketState;
  }

  // Calculate interest
  const interest = wMulDown(
    marketState.totalBorrowAssets,
    wTaylorCompounded(borrowRate, elapsed),
  );

  // Prepare updated market state with new totals
  const marketWithNewTotal = {
    ...marketState,
    totalBorrowAssets: marketState.totalBorrowAssets + interest,
    totalSupplyAssets: marketState.totalSupplyAssets + interest,
  };

  // Early return if there's no fee
  if (marketWithNewTotal.fee === 0n) {
    return marketWithNewTotal;
  }

  // Calculate fee and feeShares if the fee is not zero
  const feeAmount = wMulDown(interest, marketWithNewTotal.fee);
  const feeShares = toSharesDown(
    feeAmount,
    BigInt(marketWithNewTotal.totalSupplyAssets) - feeAmount,
    BigInt(marketWithNewTotal.totalSupplyShares),
  );

  // Return final market state including feeShares
  return {
    ...marketWithNewTotal,
    totalSupplyShares: BigInt(marketWithNewTotal.totalSupplyShares) + feeShares,
  };
};
