import { createContractsConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const contracts = createContractsConfig({
  tokens,
  contracts: {
    stakingToken: "stkWELL",
    wrappedNativeToken: "WETH",
    governanceToken: "WELL",
    comptroller: "0xfBb21d0380beE3312B33c4353c8936a0F13EF26C",
    views: "0x821Ff3a967b39bcbE8A018a9b1563EAf878bad39",
    multiRewardDistributor: "0xe9005b078701e2A0948D2EaC43010D35870Ad9d2",
    oracle: "0xEC942bE8A8114bFD0396A5052c36027f2cA6a9d0",
    router: "0x70778cfcFC475c7eA0f24cC625Baf6EaE475D0c9",
    temporalGovernor: "0x8b621804a7637b781e2BbD58e256a591F2dF7d51",
    voteCollector: "0xe0278B32c627FF6fFbbe7de6A18Ade145603e949",
    morphoBlue: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    morphoBaseBundler: "0x6BFd8137e702540E7A42B74178A4a49Ba43920C4",
    morphoBundler: "0xb98c948CFA24072e58935BC004a8A7b376AE746A",
    morphoPublicAllocator: "0xA090dD1a701408Df1d4d0B85b716c87565f90467",
    morphoViews: "0xc72fCC9793a10b9c363EeaAcaAbe422E0672B42B",
  },
});
