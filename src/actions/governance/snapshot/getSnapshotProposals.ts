import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentsFromArgs } from "../../../common/index.js";
import type { OptionalNetworkParameterType } from "../../../common/types.js";
import type { Chain } from "../../../environments/index.js";
import * as logger from "../../../logger/console.js";
import type { SnapshotProposal } from "../../../types/snapshotProposal.js";
import { getSnapshotProposalData } from "./common.js";

export type GetSnapshotProposalsParameters<
  environments,
  network extends Chain | undefined,
> = OptionalNetworkParameterType<environments, network> & {
  pagination?: {
    size?: number;
    page?: number;
  };
  filters?: {
    onlyActive?: boolean;
  };
};

export type GetSnapshotProposalsReturnType = Promise<{
  proposals: SnapshotProposal[];
  total: number;
  active: number;
}>;

export async function getSnapshotProposals<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args?: GetSnapshotProposalsParameters<environments, Network>,
): GetSnapshotProposalsReturnType {
  const { pagination, filters } = args ?? {};

  const environments = getEnvironmentsFromArgs(client, args);

  const logId = logger.start(
    "getSnapshotProposals",
    "Starting to get snapshot proposals...",
  );

  const proposals = await getSnapshotProposalData({
    environments,
    filters,
    pagination,
  });

  logger.end(logId);

  return proposals;
}
