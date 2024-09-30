import { Amount } from "../../common/index.js";
import {
  type GovernanceToken,
  publicEnvironments,
} from "../../environments/index.js";

export type GetGovernanceTokenInfoType = {
  totalSupply: Amount;
};

export async function getGovernanceTokenInfo(params: {
  governanceToken: GovernanceToken;
}): Promise<GetGovernanceTokenInfoType | undefined> {
  if (params.governanceToken === "WELL") {
    const totalSupply =
      await publicEnvironments.moonbeam.contracts.governanceToken?.read.totalSupply();

    return {
      totalSupply: new Amount(totalSupply || 0n, 18),
    };
  } else {
    const totalSupply =
      await publicEnvironments.moonriver.contracts.governanceToken?.read.totalSupply();

    return {
      totalSupply: new Amount(totalSupply || 0n, 18),
    };
  }
}
