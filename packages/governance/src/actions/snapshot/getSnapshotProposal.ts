import type { SnapshotProposal } from "@/types/snapshotProposal.js";
import _ from "lodash";
import type { Environment } from "../../../../environments/src/types/environment.js";
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
