import { Amount } from "@moonwell-sdk/common";
import { type GovernanceToken, moonbeam, moonriver } from "@moonwell-sdk/environments";

export type GetGovernanceTokenInfoType = {
  totalSupply: Amount;
};

export async function getGovernanceTokenInfo(params: {
  governanceToken: GovernanceToken;
}): Promise<GetGovernanceTokenInfoType | undefined> {
  if (params.governanceToken === "WELL") {
    const totalSupply = await moonbeam.contracts.governanceToken?.read.totalSupply();

    return {
      totalSupply: new Amount(totalSupply || 0n, 18),
    };
  } else {
    const totalSupply = await moonriver.contracts.governanceToken?.read.totalSupply();

    return {
      totalSupply: new Amount(totalSupply || 0n, 18),
    };
  }
}
