import type { MoonwellClient } from "../../../client/createMoonwellClient.js";
import { getEnvironmentsFromArgs } from "../../../common/index.js";
import type { OptionalNetworkParameterType } from "../../../common/types.js";
import {
  type Chain,
  moonbeam,
  moonriver,
} from "../../../environments/index.js";
import * as logger from "../../../logger/console.js";
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
> = OptionalNetworkParameterType<environments, network>;

export type GetProposalsReturnType = Promise<Proposal[]>;

export async function getProposals<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args?: GetProposalsParameters<environments, Network>,
): GetProposalsReturnType {
  const environments = getEnvironmentsFromArgs(client, args);

  const governanceEnvironments = environments.filter(
    (environment) =>
      environment.chainId === moonriver.id ||
      environment.chainId === moonbeam.id,
  );

  const logId = logger.start("getProposals", "Starting to get proposals...");

  const environmentProposals = await Promise.all(
    governanceEnvironments
      .filter(
        (environment) =>
          environment.chainId === moonriver.id ||
          environment.chainId === moonbeam.id,
      )
      .map((environment) =>
        Promise.all([
          getProposalData({ environment }),
          getCrossChainProposalData({ environment }),
          getExtendedProposalData({ environment }),
        ]),
      ),
  );

  logger.end(logId);

  const proposals = governanceEnvironments.flatMap((_item, index: number) => {
    const [_proposals, _xcProposals, _extendedDatas] =
      environmentProposals[index]!;

    const proposals = [..._proposals, ..._xcProposals];

    appendProposalExtendedData(proposals, _extendedDatas);

    return proposals;
  });

  return proposals;
}
