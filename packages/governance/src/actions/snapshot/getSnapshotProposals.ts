import type { SnapshotProposal } from "@/types/snapshotProposal.js";
import type { Environment } from "../../../../environments/src/types/environment.js";
import { getSnapshotProposalData } from "./common.js";

export type GetSnapshotProposalsReturnType = {
  proposals: SnapshotProposal[];
  total: number;
  active: number;
};

export const getSnapshotProposals = async (params: {
  environments?: Environment[];
  pagination?: {
    size?: number;
    page?: number;
  };
  filters?: {
    onlyActive?: boolean;
  };
}): Promise<GetSnapshotProposalsReturnType> => {
  return getSnapshotProposalData(params);
};
