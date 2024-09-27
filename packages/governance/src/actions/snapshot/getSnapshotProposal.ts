import type { SnapshotProposal } from "@/types/snapshotProposal.js";
import type { Environment } from "@moonwell-sdk/environments";
import _ from "lodash";
import { getSnapshotProposalData } from "./common.js";

export const getSnapshotProposal = async (params: {
  environment: Environment;
  id: string;
}): Promise<SnapshotProposal | undefined> => {
  const result = await getSnapshotProposalData({
    environments: [params.environment],
    filters: {
      id: params.id,
    },
  });

  return _.first(result.proposals);
};
