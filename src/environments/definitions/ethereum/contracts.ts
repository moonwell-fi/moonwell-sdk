import { createContractsConfig } from "../../types/config.js";
import { tokens } from "./tokens.js";

export const contracts = createContractsConfig({
  tokens,
  contracts: {
    // `governanceToken` is required for the WELL transfer flow's chain
    // resolution. `stakingToken` is intentionally omitted while Ethereum
    // staking is deferred (no CoreViews-equivalent deployed) — the frontend's
    // stake-page chain picker and `/stake/[network]` route both gate on
    // `contracts.stakingToken`, so leaving it absent hides Ethereum from the
    // staking UI without any frontend filter. Restore as `stakingToken:
    // "stkWELL"` (token already declared in `tokens.ts`) once the contract
    // ships.
    governanceToken: "WELL",
  },
});
