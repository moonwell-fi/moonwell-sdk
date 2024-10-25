import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import { Amount } from "../../common/index.js";
import {
  type GovernanceToken,
  publicEnvironments,
} from "../../environments/index.js";
import * as logger from "../../logger/console.js";

export type GetGovernanceTokenInfoParameters = {
  governanceToken: GovernanceToken;
};

export type GetGovernanceTokenInfoReturnType = Promise<
  | {
      totalSupply: Amount;
    }
  | undefined
>;

export async function getGovernanceTokenInfo(
  _client: MoonwellClient,
  args: GetGovernanceTokenInfoParameters,
): GetGovernanceTokenInfoReturnType {
  const logId = logger.start(
    "getGovernanceTokenInfo",
    "Starting to get governance token info...",
  );

  if (args.governanceToken === "WELL") {
    const totalSupply =
      await publicEnvironments.moonbeam.contracts.governanceToken.read.totalSupply();

    logger.end(logId);

    return {
      totalSupply: new Amount(totalSupply || 0n, 18),
    };
  } else {
    const totalSupply =
      await publicEnvironments.moonriver.contracts.governanceToken.read.totalSupply();

    logger.end(logId);
    return {
      totalSupply: new Amount(totalSupply || 0n, 18),
    };
  }
}
