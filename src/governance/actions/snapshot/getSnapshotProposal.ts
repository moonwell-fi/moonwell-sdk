import { first } from "lodash";
import type { Environment } from "../../../environments/index.js";
import type { SnapshotProposal } from "../../types/snapshotProposal.js";
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

  return first(result.proposals);
};
