import type { Environment } from "../../../environments/index.js";
import type { SnapshotProposal } from "../../types/snapshotProposal.js";
import { getSnapshotProposalData } from "./common.js";

export type GetSnapshotProposalsReturnType = {
  proposals: SnapshotProposal[];
  total: number;
  active: number;
};

export const getSnapshotProposals = async (params: {
  environments: Environment[];
  pagination?: {
    size?: number;
    page?: number;
  };
  filters?: {
    onlyActive?: boolean;
  };
}): Promise<GetSnapshotProposalsReturnType> => {
  try {
    return getSnapshotProposalData(params);
  } catch (ex) {
    console.error("An error occured while fetching snapshot proposals...", ex);
    return {
      proposals: [],
      total: 0,
      active: 0,
    };
  }
};
