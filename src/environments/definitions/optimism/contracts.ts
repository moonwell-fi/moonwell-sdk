import { createContractsConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const contracts = createContractsConfig({
  tokens,
  contracts: {
    governanceToken: "WELL",
    stakingToken: "stkWELL",
    wrappedNativeToken: "WETH",
    comptroller: "0xCa889f40aae37FFf165BccF69aeF1E82b5C511B9",
    views: "0xD6C66868f937f00604d0FB860241970D6CC2CBfE",
    multiRewardDistributor: "0xF9524bfa18C19C3E605FbfE8DFd05C6e967574Aa",
    oracle: "0x2f1490bD6aD10C9CE42a2829afa13EAc0b746dcf",
    router: "0xc4Ab8C031717d7ecCCD653BE898e0f92410E11dC",
    temporalGovernor: "0x17C9ba3fDa7EC71CcfD75f978Ef31E21927aFF3d",
    voteCollector: "0x3C968481BE3ba1a99fed5f73dB2Ff51151037738",
    morphoBlue: "0xce95AfbB8EA029495c66020883F87aaE8864AF92",
    morphoBaseBundler: "0xFBCd3C258feB131D8E038F2A3a670A7bE0507C05",
    morphoBundler: "0x79481C87f24A3C4332442A2E9faaf675e5F141f0",
    morphoPublicAllocator: "0x0d68a97324E602E02799CD83B42D337207B40658",
    morphoViews: "0x90AA62DD4Fd10955A46f77176019d908849451F8",
  },
});
