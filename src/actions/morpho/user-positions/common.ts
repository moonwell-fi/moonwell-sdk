import type { Address } from "viem";
import { Amount } from "../../../common/amount.js";
import type { Environment } from "../../../environments/index.js";
import { findTokenByAddress } from "../../../environments/utils/index.js";
import type {
  MorphoMarketUserPosition,
  MorphoVaultUserPosition,
} from "../../../types/morphoUserPosition.js";

export async function getMorphoVaultUserPositionsData(params: {
  environment: Environment;
  account: Address;
  vaults?: string[] | undefined;
}): Promise<MorphoVaultUserPosition[]> {
  const vaults = Object.values(params.environment.vaults).filter((vault) =>
    params.vaults ? params.vaults.includes(vault.address) : true,
  );

  const userVaultsShares = await Promise.all(
    vaults.map((vaultContract) =>
      vaultContract.read.balanceOf([params.account]),
    ),
  );

  const userVaultBalances = await Promise.all(
    vaults.map((vaultContract, index) =>
      vaultContract.read.convertToAssets([userVaultsShares[index]]),
    ),
  );

  return vaults.map((vaultContract, index) => {
    const shares = userVaultsShares[index];
    const balance = userVaultBalances[index];
    const vaultToken = findTokenByAddress(
      params.environment,
      vaultContract.address,
    )!;
    const vaultConfig = Object.values(params.environment.config.vaults).find(
      (vault) => vault.vaultToken === vaultToken.symbol,
    )!;
    const underlyingToken =
      params.environment.config.tokens[vaultConfig.underlyingToken];

    const result: MorphoVaultUserPosition = {
      chainId: params.environment.chainId,
      account: params.account,
      vaultToken,
      underlyingToken,
      supplied: new Amount(balance, underlyingToken.decimals),
      suppliedShares: new Amount(shares, vaultToken.decimals),
    };

    return result;
  });
}

export async function getMorphoMarketUserPositionsData(params: {
  environment: Environment;
  account: Address;
  markets?: string[] | undefined;
}): Promise<MorphoMarketUserPosition[]> {
  const markets = Object.values(params.environment.config.morphoMarkets).filter(
    (market) => (params.markets ? params.markets.includes(market.id) : true),
  );

  try {
    const userMarketPositions =
      await params.environment.contracts.morphoViews!.read.getMorphoBlueUserBalances(
        [markets.map((market) => market.id), params.account],
      );

    return markets.map((market, index) => {
      const position = userMarketPositions[index];

      const loanToken = params.environment.config.tokens[market.loanToken];

      const collateralToken =
        params.environment.config.tokens[market.collateralToken];

      const supplied = new Amount(
        position.collateralAssets,
        collateralToken.decimals,
      );

      const borrowed = new Amount(position.loanAssets, loanToken.decimals);

      const borrowedShares = new Amount(
        position.loanShares,
        loanToken.decimals + 6,
      );

      const result: MorphoMarketUserPosition = {
        chainId: params.environment.chainId,
        account: params.account,
        marketId: market.id,
        loanToken,
        collateralToken,
        supplied,
        borrowed,
        borrowedShares,
      };

      return result;
    });
  } catch (error) {
    return [];
  }
}
