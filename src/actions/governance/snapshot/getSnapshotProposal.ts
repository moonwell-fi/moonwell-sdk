import lodash from "lodash";
const { first } = lodash;
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentFromArgs } from "../../../common/index.js";
import type { NetworkParameterType } from "../../../common/types.js";
import type { Chain } from "../../../environments/index.js";
import type { SnapshotProposal } from "../../../types/snapshotProposal.js";
import { getSnapshotProposalData } from "./common.js";

export type GetSnapshotProposalParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> & {
  /** Id of the proposal */
  proposalId: string;
};

export type GetSnapshotProposalReturnType = Promise<
  SnapshotProposal | undefined
>;

export async function getSnapshotProposal<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetSnapshotProposalParameters<environments, Network>,
): GetSnapshotProposalReturnType {
  const { proposalId } = args;

  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return undefined;
  }

  const result = await getSnapshotProposalData({
    environments: [environment],
    filters: {
      id: proposalId,
    },
  });

  return first(result.proposals);
}
