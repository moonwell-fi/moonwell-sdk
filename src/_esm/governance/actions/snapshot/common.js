import axios from "axios";
import { base, optimism, supportedChains, } from "../../../environments/index.js";
export const getSnapshotProposalData = async (params) => {
    const environments = params.environments;
    const snapshotApiUrl = "https://hub.snapshot.org/graphql";
    const snapshotEnsNames = environments
        .map((env) => env.custom?.governance?.snapshotEnsName)
        .filter((name) => !!name);
    const pageSize = params.pagination?.size ? params.pagination.size : 10;
    const response = await axios.post(snapshotApiUrl, {
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
        const summary = response.data.data.spaces.reduce((total, space) => {
            return {
                proposalsCount: total.proposalsCount + space.proposalsCount,
                activeProposals: total.activeProposals + space.activeProposals,
            };
        }, { proposalsCount: 0, activeProposals: 0 });
        const result = response.data.data.proposals.map((proposal) => {
            const networkId = Number.parseInt(proposal.network);
            let chain = Object.values(supportedChains).find((c) => c.id === networkId);
            if (proposal.title.toLowerCase().includes("base")) {
                chain = base;
            }
            if (proposal.title.toLowerCase().includes("optimism")) {
                chain = optimism;
            }
            const votes = proposal.scores.reduce((a, b) => a + b, 0);
            const scores = proposal.scores.map((score, index) => ({
                votes: score,
                percent: (score / votes) * 100,
                choice: proposal.choices[index],
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
    }
    else {
        return {
            active: 0,
            proposals: [],
            total: 0,
        };
    }
};
//# sourceMappingURL=common.js.map