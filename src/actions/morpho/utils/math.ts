export const pow10 = (exponant: bigint | number) => 10n ** BigInt(exponant);
export const ORACLE_PRICE_SCALE = pow10(36);
export const WAD = pow10(18);
export const SECONDS_PER_YEAR = 3600 * 24 * 365;
export const VIRTUAL_ASSETS = 1n;
export const VIRTUAL_SHARES = 10n ** 6n;
export const MAX_UINT256 = BigInt(
  "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
);

/// -----------------------------------------------
/// -------------------- UTILS --------------------
/// -----------------------------------------------

export const wMulDown = (x: bigint, y: bigint): bigint => mulDivDown(x, y, WAD);
export const wDivDown = (x: bigint, y: bigint): bigint => mulDivDown(x, WAD, y);
export const wDivUp = (x: bigint, y: bigint): bigint => mulDivUp(x, WAD, y);
export const mulDivDown = (x: bigint, y: bigint, d: bigint): bigint =>
  (BigInt(x) * BigInt(y)) / BigInt(d);
const mulDivUp = (x: bigint, y: bigint, d: bigint): bigint =>
  (BigInt(x) * BigInt(y) + (BigInt(d) - 1n)) / BigInt(d);

export const wTaylorCompounded = (x: bigint, n: bigint): bigint => {
  const firstTerm = BigInt(x) * BigInt(n);
  const secondTerm = mulDivDown(firstTerm, firstTerm, 2n * WAD);
  const thirdTerm = mulDivDown(secondTerm, firstTerm, 3n * WAD);
  return firstTerm + secondTerm + thirdTerm;
};

export const toAssetsDown = (
  shares: bigint,
  totalAssets: bigint,
  totalShares: bigint,
): bigint => {
  return mulDivDown(
    shares,
    totalAssets + VIRTUAL_ASSETS,
    totalShares + VIRTUAL_SHARES,
  );
};

/// @dev Calculates the value of `shares` quoted in assets, rounding down.
export const toSharesDown = (
  assets: bigint,
  totalAssets: bigint,
  totalShares: bigint,
): bigint => {
  return mulDivDown(
    assets,
    totalShares + VIRTUAL_SHARES,
    totalAssets + VIRTUAL_ASSETS,
  );
};

/// @dev Calculates the value of `shares` quoted in assets, rounding up.
export const toAssetsUp = (
  shares: bigint,
  totalAssets: bigint,
  totalShares: bigint,
): bigint => {
  return mulDivUp(
    shares,
    totalAssets + VIRTUAL_ASSETS,
    totalShares + VIRTUAL_SHARES,
  );
};
