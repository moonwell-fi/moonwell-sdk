import lodash from "lodash";
const { first } = lodash;
import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentFromArgs } from "../../../common/index.js";
import type { NetworkParameterType } from "../../../common/types.js";
import type { Chain } from "../../../environments/index.js";
import type { Proposal } from "../../../types/proposal.js";
import {
  appendProposalExtendedData,
  getCrossChainProposalData,
  getExtendedProposalData,
  getProposalData,
} from "./common.js";

export type GetProposalParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network> & {
  /** Id of the proposal */
  proposalId: number;
};

export type GetProposalReturnType = Promise<Proposal | undefined>;

export async function getProposal<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetProposalParameters<environments, Network>,
): GetProposalReturnType {
  const { proposalId } = args;

  const environment = getEnvironmentFromArgs(client, args);

  if (!environment) {
    return undefined;
  }

  const [_proposals, _xcProposals, _extendedDatas] = await Promise.all([
    getProposalData({ environment, id: proposalId }),
    getCrossChainProposalData({ environment, id: proposalId }),
    getExtendedProposalData({ environment, id: proposalId }),
  ]);

  const proposals = [..._proposals, ..._xcProposals];

  appendProposalExtendedData(proposals, _extendedDatas);

  return first(proposals);
}
