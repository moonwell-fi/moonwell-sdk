import { appendProposalExtendedData, getCrossChainProposalData, getExtendedProposalData, getProposalData, } from "./common.js";
export async function getProposals(params) {
    const envs = params.environments;
    try {
        const environmentProposals = await Promise.all(envs.map((environment) => Promise.all([
            getProposalData({ environment }),
            getCrossChainProposalData({ environment }),
            getExtendedProposalData({ environment }),
        ])));
        const proposals = envs.reduce((prev, curr, index) => {
            const [_proposals, _xcProposals, _extendedDatas] = environmentProposals[index];
            const proposals = [..._proposals, ..._xcProposals];
            appendProposalExtendedData(proposals, _extendedDatas);
            return {
                ...prev,
                [curr.chainId]: proposals,
            };
        }, {});
        return proposals;
    }
    catch (ex) {
        console.error("An error occured while fetching proposals...", ex);
        return {};
    }
}
//# sourceMappingURL=getProposals.js.map