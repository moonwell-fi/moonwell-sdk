import type { SnapshotProposal } from "@/types/snapshotProposal.js";
import { type Environment, base, optimism } from "@moonwell-sdk/environments";
import axios from "axios";
import type { GetSnapshotProposalsReturnType } from "./getSnapshotProposals.js";

export const getSnapshotProposalData = async (params: {
  environments: Environment[];
  pagination?: {
    size?: number;
    page?: number;
  };
  filters?: {
    onlyActive?: boolean;
    id?: string;
  };
}): Promise<GetSnapshotProposalsReturnType> => {
  const environments = params.environments;

  const snapshotApiUrl = "https://hub.snapshot.org/graphql";
  const snapshotEnsNames = environments.map((env) => env.settings?.governance?.snapshotEnsName).filter((name) => !!name);

  const pageSize = params.pagination?.size ? params.pagination.size : 10;

  const response = await axios.post<{
    data: {
      spaces: {
        proposalsCount: number;
        activeProposals: number;
      }[];
      proposals: {
        id: string;
        title: string;
        discussion: string;
        start: number;
        end: number;
        created: number;
        state: string;
        choices: string[];
        scores: number[];
        network: string;
      }[];
    };
  }>(snapshotApiUrl, {
    query: `{
          spaces(
            where: {
              id_in: [${snapshotEnsNames.map((name) => `"${name}"`).join(",")}]
            }
          ) {
            proposalsCount,
            activeProposals
          }
          proposals(
            first: ${pageSize},
            skip: ${params.pagination?.page ? params.pagination.page * pageSize : 0},
            orderBy: "created",
            where: {
              space_in: [${snapshotEnsNames.map((name) => `"${name}"`).join(",")}]
              ${params.filters?.onlyActive ? `, state: "active"` : ""}
              ${params.filters?.id ? `, id: "${params.filters.id}"` : ""}
            },
            orderDirection: desc
          ) {
            id
            title
            discussion
            start
            end
            created
            state
            choices
            scores
            network
          }
        }`,
  });

  if (response.status === 200 && response.data?.data?.proposals) {
    const summary = response.data.data.spaces.reduce(
      (total: any, space: any) => {
        return {
          proposalsCount: total.proposalsCount + space.proposalsCount,
          activeProposals: total.activeProposals + space.activeProposals,
        };
      },
      { proposalsCount: 0, activeProposals: 0 },
    );

    const result: SnapshotProposal[] = response.data.data.proposals.map((proposal) => {
      const networkId = Number.parseInt(proposal.network);

      let chain = environments.find((env) => env.chain.id === networkId)!.chain;

      if (proposal.title.toLowerCase().includes("base")) {
        chain = base as any;
      }

      if (proposal.title.toLowerCase().includes("optimism")) {
        chain = optimism as any;
      }

      const votes = proposal.scores.reduce((a, b) => a + b, 0);
      const scores = proposal.scores.map((score, index) => ({
        votes: score,
        percent: (score / votes) * 100,
        choice: proposal.choices[index]!,
      }));

      return {
        id: proposal.id,
        created: proposal.created,
        discussion: proposal.discussion,
        network: {
          id: chain?.id,
          name: chain?.name,
        },
        end: proposal.end,
        scores,
        start: proposal.start,
        state: proposal.state,
        title: proposal.title,
        votes,
      };
    });

    return {
      active: summary.activeProposals,
      proposals: result,
      total: summary.proposalsCount,
    };
  } else {
    return {
      active: 0,
      proposals: [],
      total: 0,
    };
  }
};
