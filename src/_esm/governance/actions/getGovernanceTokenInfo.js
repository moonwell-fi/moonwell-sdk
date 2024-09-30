import { Amount } from "../../common/index.js";
import { publicEnvironments, } from "../../environments/index.js";
export async function getGovernanceTokenInfo(params) {
    if (params.governanceToken === "WELL") {
        const totalSupply = await publicEnvironments.moonbeam.contracts.governanceToken?.read.totalSupply();
        return {
            totalSupply: new Amount(totalSupply || 0n, 18),
        };
    }
    else {
        const totalSupply = await publicEnvironments.moonriver.contracts.governanceToken?.read.totalSupply();
        return {
            totalSupply: new Amount(totalSupply || 0n, 18),
        };
    }
}
//# sourceMappingURL=getGovernanceTokenInfo.js.map