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
  // Retained for API compatibility, but WELL is the only governance token left
  // now that MFAM went with Moonriver (MOO-551), so there is nothing to branch on.
  args: GetGovernanceTokenInfoParameters,
): GetGovernanceTokenInfoReturnType {
  const logId = logger.start(
    "getGovernanceTokenInfo",
    "Starting to get governance token info...",
  );

  // TypeScript already narrows `GovernanceToken` to "WELL", but a JS consumer
  // still passing "MFAM" would otherwise receive WELL's supply as a normal
  // success — silently wrong data where TS consumers get a compile error.
  // Reject it rather than let the removed token look like it still resolves.
  if (args.governanceToken !== undefined && args.governanceToken !== "WELL") {
    logger.end(logId);
    throw new Error(
      `Unsupported governance token "${args.governanceToken}". MFAM was removed with the Moonriver sunset (MOO-551); WELL is the only governance token.`,
    );
  }

  // WELL supply used to be read from Moonbeam, the original mint. That chain is
  // halted (MOO-551), so the read now targets the Ethereum multigov hub — the
  // home of live governance. Note this reports the hub's xWELL supply rather
  // than Moonbeam's historical total, so the number can differ from pre-sunset
  // releases. MFAM is gone entirely: Apollo governance ended with Moonriver.
  const totalSupply =
    await publicEnvironments.ethereum.contracts.governanceToken.read.totalSupply();

  logger.end(logId);

  return {
    totalSupply: new Amount(totalSupply || 0n, 18),
  };
}
