import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentsFromArgs } from "../../../common/index.js";
import type { NetworkParameterType } from "../../../common/types.js";
import type { Chain } from "../../../environments/index.js";
import type { Proposal } from "../../../types/proposal.js";
import {
  appendProposalExtendedData,
  getCrossChainProposalData,
  getExtendedProposalData,
  getProposalData,
} from "./common.js";

export type GetProposalsParameters<
  environments,
  network extends Chain | undefined,
> = NetworkParameterType<environments, network>;

export type GetProposalsReturnType = Promise<Proposal[]>;

export async function getProposals<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args?: GetProposalsParameters<environments, Network>,
): GetProposalsReturnType {
  const environments = getEnvironmentsFromArgs(client, args);

  const environmentProposals = await Promise.all(
    environments.map((environment) =>
      Promise.all([
        getProposalData({ environment }),
        getCrossChainProposalData({ environment }),
        getExtendedProposalData({ environment }),
      ]),
    ),
  );

  const proposals = environments.flatMap((_item, index: number) => {
    const [_proposals, _xcProposals, _extendedDatas] =
      environmentProposals[index]!;

    const proposals = [..._proposals, ..._xcProposals];

    appendProposalExtendedData(proposals, _extendedDatas);

    return proposals;
  });

  return proposals;
}
