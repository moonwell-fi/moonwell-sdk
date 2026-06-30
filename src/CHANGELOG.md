# @moonwell-fi/moonwell-sdk

## 0.20.3

### Patch Changes

- [#309](https://github.com/moonwell-fi/moonwell-sdk/pull/309) [`9dbfe47c88676325c9263cf84e7111ade21f566a`](https://github.com/moonwell-fi/moonwell-sdk/commit/9dbfe47c88676325c9263cf84e7111ade21f566a) Thanks [@bprofiro](https://github.com/bprofiro)! - Route Merkl API calls through the lunar-indexer worker proxy instead of hitting `api.merkl.xyz` directly.

  Merkl's v4 API needs a server-side API key for production rate limits, which the browser-side SDK cannot hold. Merkl campaign IDs, stkWELL staking APR, and Morpho/staking user rewards are now fetched from the lunar-indexer worker's `/api/v1/merkl` proxy (derived from each environment's `lunarIndexerUrl`), which injects the key and passes the query and response through unchanged. No public API changes — request/response shapes are identical. Consumers that enforce a network/CSP allowlist should ensure the lunar-indexer worker host is permitted (it is already used for other SDK data).

## 0.20.2

### Patch Changes

- [#306](https://github.com/moonwell-fi/moonwell-sdk/pull/306) [`5c709c5d2341d06a7ee8f446a7a14abebfd1f12d`](https://github.com/moonwell-fi/moonwell-sdk/commit/5c709c5d2341d06a7ee8f446a7a14abebfd1f12d) Thanks [@bprofiro](https://github.com/bprofiro)! - Add the Ethereum `multiRewardDistributor` (MRD_PROXY `0x60142B8d76FaC5b88cfB422Ba1aA905d2171851c`, the comptroller's `rewardDistributor()`) to the Ethereum environment config, mirroring Base and Optimism (MOO-413). The SDK derives reward APRs from the `views` contract, but the frontend's reward-claim flow branches on this address: when present it claims via the comptroller's `claimReward`, and when absent it falls back to the Moonbeam `0x…0808` precompile `batchAll` path, which reverts on Ethereum. Without it, the WELL rewards MIP-X59 starts accruing on the four Ethereum Core markets (ETH, USDC, USDT, cbBTC) would be displayed but not claimable.

## 0.20.1

### Patch Changes

- [#303](https://github.com/moonwell-fi/moonwell-sdk/pull/303) [`59d540a511cd7eb14486f8aafdf7f898d994be90`](https://github.com/moonwell-fi/moonwell-sdk/commit/59d540a511cd7eb14486f8aafdf7f898d994be90) Thanks [@lyoungblood](https://github.com/lyoungblood)! - Fix Morpho GraphQL queries broken by upstream API schema changes. The Morpho API renamed `Market.uniqueKey` to `marketId` and replaced `PublicAllocatorSharedLiquidity.allocationMarket` with `withdrawMarket`, causing the rewards and shared-liquidity queries to fail with 400 errors that were silently swallowed — every Morpho vault reported empty rewards (MOO-391). Also migrates vault rewards to `state.allRewards` and drops the deprecated `amountPerSuppliedToken`/`amountPerBorrowedToken` fields ahead of their removal (reward token amounts are now reported as 0 since the API no longer exposes them), and logs Morpho GraphQL errors in non-browser environments so failures surface in server logs.

## 0.20.0

### Minor Changes

- [#299](https://github.com/moonwell-fi/moonwell-sdk/pull/299) [`967885cee27632a0e0415360dfff9a636f78061f`](https://github.com/moonwell-fi/moonwell-sdk/commit/967885cee27632a0e0415360dfff9a636f78061f) Thanks [@apokusin](https://github.com/apokusin)! - Fix the three SDK defects behind the proposal-171 "cannot vote" incident (June 2026), where the first hub-local Ethereum proposal broke voting for all users on all chains.

  **Hub-aware multichain classification (MOO-354).** `getProposal` / `getProposals` previously set `proposal.multichain` only when a proposal's targets included a Wormhole Core Bridge — a Moonbeam-hub-era heuristic that misclassified hub-local proposals (created on the Ethereum MultichainGovernor with only same-chain targets, e.g. proposal 171) as single-chain, which routed frontend votes into a dead legacy-governor branch. Classification now flows through a new canonical `classifyProposalMultichain(proposal, legacyArtemisMaxId?)`: a proposal is multichain when it is homed on a hub chain with no legacy governor (`isMultichainHomeChain`, also exported), when its targets include a bridge, or when its proposalId is past the legacy Artemis cutoff. The same function now drives on-chain state-read routing in `getProposalsOnChainData`, so the paths cannot drift. `isMultichainAware` is deprecated in favor of `classifyProposalMultichain`.

  **`getBlockNumberAtTimestamp` never returns an unconverged bound (MOO-352).** The interpolation search silently returned its lower bound after 8 iterations even when unconverged. On Moonbeam — whose block time changed ~12s → ~6s with async backing — every interpolated probe overshoots a recent target, the lower bound never leaves block 1, and the function returned **block 1** for timestamps hours old; historical voting-power reads then reverted. The search now finishes with a binary-search completion phase: identical fast path on near-linear chains, guaranteed `~log2(range)` convergence on regime-change chains. Regression-tested against the Moonbeam 12s→6s shape and a randomized piecewise-regime invariant suite.

  **`getUserVotingPowers` per-chain failure isolation (MOO-353).** All chains were wrapped in a single `Promise.all`, so one chain's failing block resolution or views read rejected the entire multi-chain result — during the incident, the Moonbeam failure erased voting power on Ethereum/Base/Optimism too. Chains now resolve independently (`Promise.allSettled`); failed chains are reported through the environment's `onError` (`source: "getUserVotingPowers"`) and omitted from the result. **Behavioral change:** consumers that previously caught a rejection for an all-chain failure now receive partial results (or an empty array); a missing chain in the result indicates that chain's read failed or it has no views contract.

### Patch Changes

- [#299](https://github.com/moonwell-fi/moonwell-sdk/pull/299) [`da250da1dc08de63b9274d1991b0cea583629b84`](https://github.com/moonwell-fi/moonwell-sdk/commit/da250da1dc08de63b9274d1991b0cea583629b84) Thanks [@apokusin](https://github.com/apokusin)! - Make multichain classification a single source of truth so `getProposal` / `getProposals` cannot drift from on-chain routing.

  `getProposalsOnChainData` already classified each proposal with the caller env's Artemis cutoff (`classifyProposalMultichain(p, isLocal ? legacyArtemisMaxId : 0)`) to route its governor reads, but `getProposal` and `getProposals` then **re-classified** with `classifyProposalMultichain(apiProposal)` — omitting the cutoff. The two could disagree: a Moonbeam-homed proposal with local-only targets past the Artemis cutoff routed through the multichain governor for its on-chain state, yet was written out with `proposal.multichain` unset (and hub-local Ethereum proposals relied on the home-chain check landing in both places). `getProposalsOnChainData` now returns its `isMultichain` decision on `ProposalOnChainData`, and both fetchers consume it instead of re-deriving — eliminating the divergence and guaranteeing `proposal.multichain` is populated whenever the on-chain reads were routed as multichain. No public API change (`ProposalOnChainData` is internal).

## 0.19.1

### Patch Changes

- [#297](https://github.com/moonwell-fi/moonwell-sdk/pull/297) [`da1c36553303a07181924189a32302fa26ae943e`](https://github.com/moonwell-fi/moonwell-sdk/commit/da1c36553303a07181924189a32302fa26ae943e) Thanks [@bprofiro](https://github.com/bprofiro)! - Wire the Ethereum mainnet Unitroller (`0xdec80bb934397575594e91970b37baf65f5b21be`) as `contracts.comptroller` on the Ethereum environment. Consumers can now call `enterMarkets` / `exitMarket` for the 4 Core markets — without this, the frontend's "Enable as collateral" modal built its `useTransaction` against an undefined contract address, which caused the confirm button to silently no-op (no wallet prompt, no toast, no console error).

## 0.19.0

### Minor Changes

- [#293](https://github.com/moonwell-fi/moonwell-sdk/pull/293) [`4f67f1f47762385a369461f7f317455686abeaab`](https://github.com/moonwell-fi/moonwell-sdk/commit/4f67f1f47762385a369461f7f317455686abeaab) Thanks [@bprofiro](https://github.com/bprofiro)! - Add Moonwell Core lending on Ethereum mainnet. The Ethereum environment now registers the 4 launch markets — `MOONWELL_ETH` (mETH), `MOONWELL_USDC` (mUSDC), `MOONWELL_USDT` (mUSDT), `MOONWELL_cbBTC` (mcbBTC) — along with their underlyings (WETH, USDT, cbBTC; USDC was already present). `getMarkets()` returns Ethereum entries sourced from the Lunar Indexer (`chainId=1`) where it previously returned nothing for chain 1, and `MarketsType<EthereumEnvironment>` resolves to the new market keys instead of `undefined`. Consumers iterating `keyof MarketsType<...>` over Ethereum will now see the 4 markets.

  `MOONWELL_ETH.underlyingToken` is registered as `"ETH"` (native, `zeroAddress`) — mirroring the Base / Optimism convention where the on-chain `mToken.underlying()` returns WETH but the SDK config presents the market as native ETH so the frontend mWETHRouter can wrap on supply and unwrap on withdraw. Also wires `wrappedNativeToken: "WETH"` and the mWETHRouter address (`0xa218A4776E2487EaA25e738e6d6a64f21593cA22`) on the Ethereum contracts config for the same purpose.

## 0.18.0

### Minor Changes

- [#290](https://github.com/moonwell-fi/moonwell-sdk/pull/290) [`7ec897474a32cc6fc2e27db16c05e6674244176e`](https://github.com/moonwell-fi/moonwell-sdk/commit/7ec897474a32cc6fc2e27db16c05e6674244176e) Thanks [@bprofiro](https://github.com/bprofiro)! - Resolve on-chain proposal data for Ethereum-hub multigov proposals fetched through the Moonbeam governance environment. `getProposalsOnChainData` now looks up the proposal's home environment from `publicEnvironments` when the proposal's `chainId` differs from the calling governance env's `chainId`, and reads `state` and `proposalData` (for `eta`) against that env's `multichainGovernor`. Previously, foreign-chain proposals bailed out with `eta: 0` and `votesCollected: false`, which left the proposal-detail timeline stuck without a timelock countdown and unable to flip from "Vote Collection" to "Ready to Execute". `votesCollected` is now derived from the governor's own state machine — true once the on-chain state advances past `MultichainVoteCollection` (i.e., Canceled / Defeated / Succeeded / Executed) — instead of summing per-satellite `chainVoteCollectorVotes`. The previous AND-of-non-zero-tallies gate would pin `votesCollected: false` forever for low-participation proposals, since a satellite with no voters reports `[0,0,0]` permanently. The returned `state` is now normalized through `MultichainProposalStateMapping`, so consumers always see values in the public `ProposalState` enum (previously the raw governor enum leaked through and `MultichainVoteCollection(1)` collided with `ProposalState.Active(1)`). Paired with that, the `getProposal` / `getProposals` Queued-promotion gate is tightened from `< Queued` to `=== Succeeded` so terminal `Canceled` / `Defeated` proposals — which now also satisfy `votesCollected: true` — are not mislabeled as Queued. Optimism's `custom` config now exposes `wormhole.chainId: 24`, matching the on-chain hub's registered vote-collection chains (Wormhole IDs 16/30/24 = Moonbeam/Base/Optimism). When state/proposals reads fail (RPC outage, ABI mismatch), the state falls back to a value derived from indexed events instead of surfacing as `Pending(0)`. Moonbeam-hub proposals continue to take the local-env path and are unaffected.

## 0.17.1

### Patch Changes

- [#291](https://github.com/moonwell-fi/moonwell-sdk/pull/291) [`70bca2941e3f7b6f85a0539f49f70a94e5d06929`](https://github.com/moonwell-fi/moonwell-sdk/commit/70bca2941e3f7b6f85a0539f49f70a94e5d06929) Thanks [@bprofiro](https://github.com/bprofiro)! - Remove the Moonbeam-specific `tokenVotes` mask from `getUserVotingPowers` and `getDelegates`. The Moonbeam `MoonwellViews` implementation was upgraded on-chain to read xWELL for `tokenVotes` (matching Base and Optimism), so the temporary `RAW_WELL_MASKED_CHAINS` workaround is no longer needed. Both actions now return the views response unchanged on Moonbeam, the same as every other chain, so `totalDelegated` once again reflects the user's full xWELL + stkWELL + claims voting power on Moonbeam instead of zeroing the xWELL contribution.

## 0.17.0

### Minor Changes

- [#288](https://github.com/moonwell-fi/moonwell-sdk/pull/288) [`53effebc688e5aaa6f520efb242244ce954d40fc`](https://github.com/moonwell-fi/moonwell-sdk/commit/53effebc688e5aaa6f520efb242244ce954d40fc) Thanks [@bprofiro](https://github.com/bprofiro)! - Recognize Ethereum-home multichain proposals and enable Moonbeam-wallet voting on them. `isMultichainProposal` now matches both the Moonbeam Wormhole Core Bridge (existing behavior) and the Ethereum Wormhole Core Bridge (`0x98f3c9e6e3face36baad05fe09d375ef1464288b`), so proposals created on the Ethereum multigov hub no longer fall through the cross-chain check and get incorrectly classified as single-chain. `getProposal` (singular) now resolves Ethereum-home proposals when called with `chainId: 1` by routing through the Moonbeam Governor API path that already handles both chainIds — previously it bailed out at the `!moonbeam && !moonriver` env check and returned `undefined`, breaking direct deep-links to Ethereum proposals. Moonbeam's contracts config gains `voteCollector: "0xB8A798a50a7274A13449B7f2Dd6Df22faF2d40E5"` — the satellite collector deployed when governance moved to Ethereum — so consumers can route Moonbeam-resident votes to the new hub.

- [#288](https://github.com/moonwell-fi/moonwell-sdk/pull/288) [`dcfb1ff5e289fa4b12adc7ccde84d0c2a6f3d8d6`](https://github.com/moonwell-fi/moonwell-sdk/commit/dcfb1ff5e289fa4b12adc7ccde84d0c2a6f3d8d6) Thanks [@bprofiro](https://github.com/bprofiro)! - Exclude raw WELL (`tokenVotes`) from voting power on Moonbeam (chainId 1284). Raw WELL — even delegated — is no longer an eligible voting source on Moonbeam; users vote with stkWELL (via `stakingVotes`) and xWELL only. `getUserVotingPowers` now returns zero for every `token*` field on Moonbeam and excludes the `tokenVotes` contribution from `totalDelegated`, `totalDelegatedSelf`, and `totalDelegatedOthers`. `getDelegates` applies the same mask when ranking delegates by voting power. The Moonbeam views contract still surfaces a non-zero `tokenVotes` tuple, so the SDK masks it here to keep results honest until the on-chain views are updated. Other chains (Base, Optimism, Ethereum) are unaffected.

## 0.16.1

### Patch Changes

- [#286](https://github.com/moonwell-fi/moonwell-sdk/pull/286) [`d1b7d7b7e4b014d6d5aaea4a2f3eccf8428781db`](https://github.com/moonwell-fi/moonwell-sdk/commit/d1b7d7b7e4b014d6d5aaea4a2f3eccf8428781db) Thanks [@bprofiro](https://github.com/bprofiro)! - Update Ethereum mainnet `views` contract address to `0x2d85b9c48a8c582f0AA244e134e9C6f30Cf7786e`.

## 0.16.0

### Minor Changes

- [#284](https://github.com/moonwell-fi/moonwell-sdk/pull/284) [`9c265b8f26ee11932c2c7b6ad63f97754a5dfa9c`](https://github.com/moonwell-fi/moonwell-sdk/commit/9c265b8f26ee11932c2c7b6ad63f97754a5dfa9c) Thanks [@bprofiro](https://github.com/bprofiro)! - Wire the full Ethereum CoreViews contract (`0xA061Ed814bBd1b03e8df0B7AbEbc40f4A6feb895`), replacing the staking-only proxy, and expose the Ethereum MultichainGovernor (`0x8769B70ac7c93AF0e75de0D69877709B66d75838`) so consumers can cast votes on Eth-side proposals. `getUserVotingPowers` and `getDelegates` now include Ethereum mainnet alongside Moonbeam, Base, and Optimism.

- [#284](https://github.com/moonwell-fi/moonwell-sdk/pull/284) [`85ac822dd451faef723a1abbe1aa7948b146cda9`](https://github.com/moonwell-fi/moonwell-sdk/commit/85ac822dd451faef723a1abbe1aa7948b146cda9) Thanks [@bprofiro](https://github.com/bprofiro)! - Resolve Eth multigov proposal descriptions from IPFS via Pinata. The lunar indexer now surfaces these as `ipfs://<hash>` URIs; the SDK fetches and substitutes the plaintext markdown before subtitle extraction so consumers see resolved descriptions. Per-proposal fetch failures are routed through `env.onError` (matching `getProposalData` / `getExtendedProposalData`) and the `ipfs://` URI is left in place — frontend consumers can detect this with `description.startsWith("ipfs://")` if they want to show a fallback. Non-string gateway responses are rejected explicitly so they don't poison the in-memory cache.

## 0.15.0

### Minor Changes

- [#280](https://github.com/moonwell-fi/moonwell-sdk/pull/280) [`c1468926c17754c111f2f0ba876c88b055e68895`](https://github.com/moonwell-fi/moonwell-sdk/commit/c1468926c17754c111f2f0ba876c88b055e68895) Thanks [@bprofiro](https://github.com/bprofiro)! - Enable staking on Ethereum mainnet — wire the newly deployed staking views contract (`0xF5f2ae75d762B7e2B42D53f48018436f52Ce5401`) and stkWELL so `getStakingInfo`, `getUserStakingInfo`, and `getStakingSnapshots` return Ethereum entries alongside Base / Optimism / Moonbeam. The Eth views contract is staking-only and does not expose `getUserVotingPower`, so `getUserVotingPowers` skips Ethereum with a one-time console warning.

## 0.14.0

### Minor Changes

- [#281](https://github.com/moonwell-fi/moonwell-sdk/pull/281) [`e74cce56e72d6cefc992dfb33d81e8c96a97dab6`](https://github.com/moonwell-fi/moonwell-sdk/commit/e74cce56e72d6cefc992dfb33d81e8c96a97dab6) Thanks [@bprofiro](https://github.com/bprofiro)! - Support the new multigov-ethereum governance indexer. `getProposals` now fetches and merges proposals from both chainId=1 (Ethereum multigov) and chainId=1284 (Moonbeam historical) under the Moonbeam network. `getProposal` and `getUserVoteReceipt` accept an optional `chainId` argument to disambiguate, falling back to trying both chains when omitted.

  Internally, every governor-indexer HTTP call now sends a required `chainId` query parameter on the list endpoint and uses chain-prefixed proposal IDs (e.g. `1-0000000007`) on the detail/votes/vote-receipt routes, matching the new indexer contract.

  Caveat: Ethereum (chainId=1) proposals returned by `getProposals` currently come back with `quorum = 0n` and a `state` value derived from API events rather than read on-chain, because the Ethereum environment doesn't yet have the multichainGovernor contract wired up. Consumers should treat `quorum.value === 0n` for these proposals as "unknown" rather than as a literal zero quorum until a follow-up release wires the contract.

## 0.13.1

### Patch Changes

- [#276](https://github.com/moonwell-fi/moonwell-sdk/pull/276) [`f376cfb7b04f8fcd19194b53d614040dbbddd919`](https://github.com/moonwell-fi/moonwell-sdk/commit/f376cfb7b04f8fcd19194b53d614040dbbddd919) Thanks [@lyoungblood](https://github.com/lyoungblood)! - Read WELL/USD from the Base lending oracle's mWELL underlying price across all WELL-governed chains, instead of the per-chain views.getGovernanceTokenPrice(). The Moonbeam views contract returns stale data and the Base views returns 0; the Base oracle is the authoritative Chainlink-fed source. Moonriver (MFAM) keeps reading its own per-chain price — only WELL-governed chains route through Base.

  Also restore staking info on Moonbeam by falling back to direct stkWELL reads when the views' getStakingInfo() / getUserStakingInfo() revert. The stkWELL fallback now reads each field independently (Promise.allSettled) so a transient RPC failure on one read doesn't erase the whole fallback.

  **Note for consumers:** every WELL price read now requires Base RPC access. If you create a MoonwellClient with only Moonbeam or Optimism configured, the SDK will fall back to the default public Base RPC. Configure Base explicitly in `networks` to honor your own RPC URL and onError handler.

## 0.13.0

### Minor Changes

- [#270](https://github.com/moonwell-fi/moonwell-sdk/pull/270) [`a0973bb66f4716accf4a3d3e5b09eb820ab1a0b8`](https://github.com/moonwell-fi/moonwell-sdk/commit/a0973bb66f4716accf4a3d3e5b09eb820ab1a0b8) Thanks [@bprofiro](https://github.com/bprofiro)! - Add Ethereum mainnet environment with xWELL token + Wormhole adapter for WELL→Ethereum transfers, voting-power reads, and circulating-supply snapshots via Lunar Indexer

- [#272](https://github.com/moonwell-fi/moonwell-sdk/pull/272) [`6af7914f55e41e98849d661ae8bbbdbad917ce25`](https://github.com/moonwell-fi/moonwell-sdk/commit/6af7914f55e41e98849d661ae8bbbdbad917ce25) Thanks [@bprofiro](https://github.com/bprofiro)! - Add opt-in `throwOnExternalApiError` option to `getMorphoUserRewards`. When `true`, Merkl API failures (non-ok HTTP responses, network rejections, and response-body parse errors) propagate to the caller as `MerklApiError` instead of being swallowed and returning `[]`. Defaults to `false`, so existing consumers see no behavior change.

  When multiple chains are queried and at least one fails while others succeed, the action throws a `MorphoUserRewardsAggregateError` whose `errors` array carries the per-chain failures and whose `rewards` property carries the rewards from chains that succeeded, so callers can surface partial results alongside the failures.

  New public exports: `MerklApiError`, `MorphoUserRewardsAggregateError`.

## 0.12.2

### Patch Changes

- [#268](https://github.com/moonwell-fi/moonwell-sdk/pull/268) [`e2f61efd290ca5ecd78b18b48552d0db578b7868`](https://github.com/moonwell-fi/moonwell-sdk/commit/e2f61efd290ca5ecd78b18b48552d0db578b7868) Thanks [@bprofiro](https://github.com/bprofiro)! - Stop calling the deprecated Morpho URD endpoint and route post-Artemis Moonbeam proposals to the multichain governor

## 0.12.1

### Patch Changes

- [#264](https://github.com/moonwell-fi/moonwell-sdk/pull/264) [`6d8ccab641cf5a3c082eb5d80b01d2ba4d06bd76`](https://github.com/moonwell-fi/moonwell-sdk/commit/6d8ccab641cf5a3c082eb5d80b01d2ba4d06bd76) Thanks [@bprofiro](https://github.com/bprofiro)! - Add `snapshotTimestamp` to `getUserVotingPowers` for correct per-chain snapshot blocks across multi-chain governance tokens.

- [#264](https://github.com/moonwell-fi/moonwell-sdk/pull/264) [`9a7e0f5267cbda2f02beaf6016a5f55e214239ec`](https://github.com/moonwell-fi/moonwell-sdk/commit/9a7e0f5267cbda2f02beaf6016a5f55e214239ec) Thanks [@bprofiro](https://github.com/bprofiro)! - add fetch with retry util on api fetches

## 0.12.0

### Minor Changes

- [#262](https://github.com/moonwell-fi/moonwell-sdk/pull/262) [`5dcd1fd7f9e05dfeb890824915845a792f173995`](https://github.com/moonwell-fi/moonwell-sdk/commit/5dcd1fd7f9e05dfeb890824915845a792f173995) Thanks [@bprofiro](https://github.com/bprofiro)! - remove ponder and subgraph dead code

## 0.11.0

### Minor Changes

- [#260](https://github.com/moonwell-fi/moonwell-sdk/pull/260) [`cc83ffd2babd54b26679cc128c468aeb8f603501`](https://github.com/moonwell-fi/moonwell-sdk/commit/cc83ffd2babd54b26679cc128c468aeb8f603501) Thanks [@bprofiro](https://github.com/bprofiro)! - replace ponder for lunar-indexer on getMorphoVaultUserPositionSnapshots

## 0.10.7

### Patch Changes

- [#258](https://github.com/moonwell-fi/moonwell-sdk/pull/258) [`c483cf01f71051e740c1dc71583a3316c96eefbc`](https://github.com/moonwell-fi/moonwell-sdk/commit/c483cf01f71051e740c1dc71583a3316c96eefbc) Thanks [@bprofiro](https://github.com/bprofiro)! - Fix meUSDC vaults names

## 0.10.6

### Patch Changes

- [#254](https://github.com/moonwell-fi/moonwell-sdk/pull/254) [`e33f6e7a4197aafce0a2433d8c8a1c4c86993e8d`](https://github.com/moonwell-fi/moonwell-sdk/commit/e33f6e7a4197aafce0a2433d8c8a1c4c86993e8d) Thanks [@bprofiro](https://github.com/bprofiro)! - For V2 vaults, substitute TVL from the paired V1 vault and use V1 snapshots

## 0.10.4

### Patch Changes

- [#251](https://github.com/moonwell-fi/moonwell-sdk/pull/251) [`91f5063d00e225ecccc3b34b42ede0dcbe1c7003`](https://github.com/moonwell-fi/moonwell-sdk/commit/91f5063d00e225ecccc3b34b42ede0dcbe1c7003) Thanks [@bprofiro](https://github.com/bprofiro)! - Add reallocatable liquidity to morpho markets snapshots

## 0.10.3

### Patch Changes

- [#246](https://github.com/moonwell-fi/moonwell-sdk/pull/246) [`c02a4c69b6f4abf782a071642bd40cc2cd2d5624`](https://github.com/moonwell-fi/moonwell-sdk/commit/c02a4c69b6f4abf782a071642bd40cc2cd2d5624) Thanks [@bprofiro](https://github.com/bprofiro)! - auto-discover merkl campaign

- [#210](https://github.com/moonwell-fi/moonwell-sdk/pull/210) [`49727ea0c6f93cac6688ff0eb4050dcb9fffb596`](https://github.com/moonwell-fi/moonwell-sdk/commit/49727ea0c6f93cac6688ff0eb4050dcb9fffb596) Thanks [@bprofiro](https://github.com/bprofiro)! - add remaining morpho v2 vaults

## 0.10.2

### Patch Changes

- [#243](https://github.com/moonwell-fi/moonwell-sdk/pull/243) [`6fabf9ea3cdc05ed1cb5dfdba1f1348d9348889e`](https://github.com/moonwell-fi/moonwell-sdk/commit/6fabf9ea3cdc05ed1cb5dfdba1f1348d9348889e) Thanks [@bprofiro](https://github.com/bprofiro)! - reduce external HTTP calls in getMorphoUserRewards

## 0.10.1

### Patch Changes

- [#241](https://github.com/moonwell-fi/moonwell-sdk/pull/241) [`e6bfb70e4ac6637be25d1924ee1319588efb9455`](https://github.com/moonwell-fi/moonwell-sdk/commit/e6bfb70e4ac6637be25d1924ee1319588efb9455) Thanks [@bprofiro](https://github.com/bprofiro)! - add VVV core market

## 0.10.0

### Minor Changes

- [#235](https://github.com/moonwell-fi/moonwell-sdk/pull/235) [`9080be22b6c27c8482544870068303abc3d072b6`](https://github.com/moonwell-fi/moonwell-sdk/commit/9080be22b6c27c8482544870068303abc3d072b6) Thanks [@bprofiro](https://github.com/bprofiro)! - migrate stake fetchings to lunar indexer and add granularity per period engine

### Patch Changes

- [#237](https://github.com/moonwell-fi/moonwell-sdk/pull/237) [`0e3b653eb05671fa52b65de9e22b29d7b050c71e`](https://github.com/moonwell-fi/moonwell-sdk/commit/0e3b653eb05671fa52b65de9e22b29d7b050c71e) Thanks [@bprofiro](https://github.com/bprofiro)! - add circulating supply and remove subgraph dependencies

## 0.9.34

### Patch Changes

- [#238](https://github.com/moonwell-fi/moonwell-sdk/pull/238) [`95ec27a3200f362f9b70d393815cd4248387235d`](https://github.com/moonwell-fi/moonwell-sdk/commit/95ec27a3200f362f9b70d393815cd4248387235d) Thanks [@bprofiro](https://github.com/bprofiro)! - include timestamp in proposal state changes

## 0.9.33

### Patch Changes

- [#218](https://github.com/moonwell-fi/moonwell-sdk/pull/218) [`779f8063ad980169436b843804132fa12c04fb5d`](https://github.com/moonwell-fi/moonwell-sdk/commit/779f8063ad980169436b843804132fa12c04fb5d) Thanks [@bprofiro](https://github.com/bprofiro)! - migrate morpho markets fetch to lunar-indexer

## 0.9.32

### Patch Changes

- [#230](https://github.com/moonwell-fi/moonwell-sdk/pull/230) [`95a1eeec81c32340c663485327c3f57b557bb545`](https://github.com/moonwell-fi/moonwell-sdk/commit/95a1eeec81c32340c663485327c3f57b557bb545) Thanks [@bprofiro](https://github.com/bprofiro)! - update merkl id

## 0.9.31

### Patch Changes

- [#227](https://github.com/moonwell-fi/moonwell-sdk/pull/227) [`5c623087403b68c8d57d86ee992e73b25046a1a9`](https://github.com/moonwell-fi/moonwell-sdk/commit/5c623087403b68c8d57d86ee992e73b25046a1a9) Thanks [@bprofiro](https://github.com/bprofiro)! - replace moonriver views contract

## 0.9.30

### Patch Changes

- [#209](https://github.com/moonwell-fi/moonwell-sdk/pull/209) [`7eb01020485f8dab2883a5f9a0f0134ab8774272`](https://github.com/moonwell-fi/moonwell-sdk/commit/7eb01020485f8dab2883a5f9a0f0134ab8774272) Thanks [@bprofiro](https://github.com/bprofiro)! - migrate vaults fetching to lunar-indexer

## 0.9.29

### Patch Changes

- [#225](https://github.com/moonwell-fi/moonwell-sdk/pull/225) [`7c0014d3d5cdf4a3a6875c91addc0c80d9de4082`](https://github.com/moonwell-fi/moonwell-sdk/commit/7c0014d3d5cdf4a3a6875c91addc0c80d9de4082) Thanks [@bprofiro](https://github.com/bprofiro)! - fix rewards apy

## 0.9.28

### Patch Changes

- [#224](https://github.com/moonwell-fi/moonwell-sdk/pull/224) [`e05dec50f5b625f3f635ffe7e3ba40631c63abd8`](https://github.com/moonwell-fi/moonwell-sdk/commit/e05dec50f5b625f3f635ffe7e3ba40631c63abd8) Thanks [@bprofiro](https://github.com/bprofiro)! - fix markets snapshots

- [#222](https://github.com/moonwell-fi/moonwell-sdk/pull/222) [`31fea7b3cb46c807604c01e57ea8ae5b73b8995c`](https://github.com/moonwell-fi/moonwell-sdk/commit/31fea7b3cb46c807604c01e57ea8ae5b73b8995c) Thanks [@bprofiro](https://github.com/bprofiro)! - add fallback to failed oracle prices

## 0.9.27

### Patch Changes

- [#220](https://github.com/moonwell-fi/moonwell-sdk/pull/220) [`24d39b2ca3215d74d36e888cb811df8f0792c13d`](https://github.com/moonwell-fi/moonwell-sdk/commit/24d39b2ca3215d74d36e888cb811df8f0792c13d) Thanks [@lyoungblood](https://github.com/lyoungblood)! - Use official Moonwell RPCs

- [#206](https://github.com/moonwell-fi/moonwell-sdk/pull/206) [`5044b6d58427e9c1f968fa4130254a449a8651a6`](https://github.com/moonwell-fi/moonwell-sdk/commit/5044b6d58427e9c1f968fa4130254a449a8651a6) Thanks [@bprofiro](https://github.com/bprofiro)! - migrate markets fetch to use lunar-indexer

## 0.9.25

### Patch Changes

- [#216](https://github.com/moonwell-fi/moonwell-sdk/pull/216) [`05618b60da5c3ce77c909389df0671c4157d9c68`](https://github.com/moonwell-fi/moonwell-sdk/commit/05618b60da5c3ce77c909389df0671c4157d9c68) Thanks [@bprofiro](https://github.com/bprofiro)! - Fix governance token price logic

## 0.9.24

### Patch Changes

- [#214](https://github.com/moonwell-fi/moonwell-sdk/pull/214) [`1b40e6ce2c3aad6e91205272c799c08f41f4158b`](https://github.com/moonwell-fi/moonwell-sdk/commit/1b40e6ce2c3aad6e91205272c799c08f41f4158b) Thanks [@avp1598](https://github.com/avp1598)! - fix proposal response shape

## 0.9.23

### Patch Changes

- [#212](https://github.com/moonwell-fi/moonwell-sdk/pull/212) [`c7d45deb94d892b883e45cd6ffa4806cda544676`](https://github.com/moonwell-fi/moonwell-sdk/commit/c7d45deb94d892b883e45cd6ffa4806cda544676) Thanks [@bprofiro](https://github.com/bprofiro)! - Fix rewards breakdown

## 0.9.22

### Patch Changes

- [#207](https://github.com/moonwell-fi/moonwell-sdk/pull/207) [`d703dea0a142f35b0b0ae6ab10a425cfc8b0427d`](https://github.com/moonwell-fi/moonwell-sdk/commit/d703dea0a142f35b0b0ae6ab10a425cfc8b0427d) Thanks [@bprofiro](https://github.com/bprofiro)! - fix v2 vaults allocation

- [#207](https://github.com/moonwell-fi/moonwell-sdk/pull/207) [`2c9b2abad07aef1f8a55cd3c1fce905bdc574be8`](https://github.com/moonwell-fi/moonwell-sdk/commit/2c9b2abad07aef1f8a55cd3c1fce905bdc574be8) Thanks [@bprofiro](https://github.com/bprofiro)! - remove unused market

## 0.9.21

### Patch Changes

- [#201](https://github.com/moonwell-fi/moonwell-sdk/pull/201) [`576cb3f82564c2dfb0850e7f47a680415e12122f`](https://github.com/moonwell-fi/moonwell-sdk/commit/576cb3f82564c2dfb0850e7f47a680415e12122f) Thanks [@bprofiro](https://github.com/bprofiro)! - add morpho vault v2 support

- [#202](https://github.com/moonwell-fi/moonwell-sdk/pull/202) [`5f513720d9da386b124d4cd434c7ad87c2baaf44`](https://github.com/moonwell-fi/moonwell-sdk/commit/5f513720d9da386b124d4cd434c7ad87c2baaf44) Thanks [@bprofiro](https://github.com/bprofiro)! - update merkl campaign id

## 0.9.20

### Patch Changes

- [#204](https://github.com/moonwell-fi/moonwell-sdk/pull/204) [`223c9320b3e48924966aa584bb91518085043eee`](https://github.com/moonwell-fi/moonwell-sdk/commit/223c9320b3e48924966aa584bb91518085043eee) Thanks [@bprofiro](https://github.com/bprofiro)! - fix build

- [#200](https://github.com/moonwell-fi/moonwell-sdk/pull/200) [`0193bdeb9afe40c1d884eafbacf865d71660fff9`](https://github.com/moonwell-fi/moonwell-sdk/commit/0193bdeb9afe40c1d884eafbacf865d71660fff9) Thanks [@bprofiro](https://github.com/bprofiro)! - deprecate op vault and op isolated markets

## 0.9.19

### Patch Changes

- [#198](https://github.com/moonwell-fi/moonwell-sdk/pull/198) [`58f09c9f513af49ff1a727b924fc6be8551c4f1d`](https://github.com/moonwell-fi/moonwell-sdk/commit/58f09c9f513af49ff1a727b924fc6be8551c4f1d) Thanks [@bprofiro](https://github.com/bprofiro)! - deprecate moonriver markets

## 0.9.18

### Patch Changes

- [#196](https://github.com/moonwell-fi/moonwell-sdk/pull/196) [`ff59c56751386c39f27045c14479dd2a20d6ca7a`](https://github.com/moonwell-fi/moonwell-sdk/commit/ff59c56751386c39f27045c14479dd2a20d6ca7a) Thanks [@bprofiro](https://github.com/bprofiro)! - fix user vote receipt

## 0.9.17

### Patch Changes

- [#194](https://github.com/moonwell-fi/moonwell-sdk/pull/194) [`23d73873629b75fc4398d59e31408a8197a35667`](https://github.com/moonwell-fi/moonwell-sdk/commit/23d73873629b75fc4398d59e31408a8197a35667) Thanks [@bprofiro](https://github.com/bprofiro)! - add new merkl campaign

## 0.9.16

### Patch Changes

- [#188](https://github.com/moonwell-fi/moonwell-sdk/pull/188) [`79d51fc0eb9940eb8ddeaf989e76ceb4df9efd18`](https://github.com/moonwell-fi/moonwell-sdk/commit/79d51fc0eb9940eb8ddeaf989e76ceb4df9efd18) Thanks [@bprofiro](https://github.com/bprofiro)! - change governance indexer to lunar-indexer

## 0.9.15

### Patch Changes

- [#189](https://github.com/moonwell-fi/moonwell-sdk/pull/189) [`8f29aae57890c80475595e25a8725c2b29fcc95c`](https://github.com/moonwell-fi/moonwell-sdk/commit/8f29aae57890c80475595e25a8725c2b29fcc95c) Thanks [@bprofiro](https://github.com/bprofiro)! - fix bigint conversion

## 0.9.14

### Patch Changes

- [#186](https://github.com/moonwell-fi/moonwell-sdk/pull/186) [`8c923e0319485947bd650fa1199464b779bddc06`](https://github.com/moonwell-fi/moonwell-sdk/commit/8c923e0319485947bd650fa1199464b779bddc06) Thanks [@bprofiro](https://github.com/bprofiro)! - update merkl campaign id

## 0.9.13

### Patch Changes

- [#184](https://github.com/moonwell-fi/moonwell-sdk/pull/184) [`b114f8f355e666e66ab25d724a09dbc2c1bc26af`](https://github.com/moonwell-fi/moonwell-sdk/commit/b114f8f355e666e66ab25d724a09dbc2c1bc26af) Thanks [@bprofiro](https://github.com/bprofiro)! - Return total collateral assets

## 0.9.12

### Patch Changes

- [#182](https://github.com/moonwell-fi/moonwell-sdk/pull/182) [`1eb34a1ea045d450719a6fe1f733bffa9686b772`](https://github.com/moonwell-fi/moonwell-sdk/commit/1eb34a1ea045d450719a6fe1f733bffa9686b772) Thanks [@bprofiro](https://github.com/bprofiro)! - update merkl campaign

## 0.9.11

### Patch Changes

- [#180](https://github.com/moonwell-fi/moonwell-sdk/pull/180) [`fb9fbd59c5b184d43391e947a4fc65cd2b92111f`](https://github.com/moonwell-fi/moonwell-sdk/commit/fb9fbd59c5b184d43391e947a4fc65cd2b92111f) Thanks [@bprofiro](https://github.com/bprofiro)! - fix rpc

## 0.9.10

### Patch Changes

- [#178](https://github.com/moonwell-fi/moonwell-sdk/pull/178) [`604ae81a653fdd1aded650022daa7b44281d1648`](https://github.com/moonwell-fi/moonwell-sdk/commit/604ae81a653fdd1aded650022daa7b44281d1648) Thanks [@bprofiro](https://github.com/bprofiro)! - uncomment collateralAssets fr markets with non active vaults positions"

## 0.9.9

### Patch Changes

- [#176](https://github.com/moonwell-fi/moonwell-sdk/pull/176) [`8fe8970b043ec5d44e6211d1865805dfa6b9af5a`](https://github.com/moonwell-fi/moonwell-sdk/commit/8fe8970b043ec5d44e6211d1865805dfa6b9af5a) Thanks [@bprofiro](https://github.com/bprofiro)! - update vaults campaign

## 0.9.8

### Patch Changes

- [#174](https://github.com/moonwell-fi/moonwell-sdk/pull/174) [`c7ed255ad412eb1cbdb0ae44440a0a8c1c6c7642`](https://github.com/moonwell-fi/moonwell-sdk/commit/c7ed255ad412eb1cbdb0ae44440a0a8c1c6c7642) Thanks [@bprofiro](https://github.com/bprofiro)! - update stkwell campaign id

## 0.9.7

### Patch Changes

- [#172](https://github.com/moonwell-fi/moonwell-sdk/pull/172) [`0d81755c1da93a063cb53760f02825da05a65c72`](https://github.com/moonwell-fi/moonwell-sdk/commit/0d81755c1da93a063cb53760f02825da05a65c72) Thanks [@bprofiro](https://github.com/bprofiro)! - fix build

## 0.9.6

### Patch Changes

- [#170](https://github.com/moonwell-fi/moonwell-sdk/pull/170) [`9a7b41c40c8e913cf27454929feaad8e2a80803a`](https://github.com/moonwell-fi/moonwell-sdk/commit/9a7b41c40c8e913cf27454929feaad8e2a80803a) Thanks [@bprofiro](https://github.com/bprofiro)! - fix stkWELL price on snapshots

## 0.9.5

### Patch Changes

- [#168](https://github.com/moonwell-fi/moonwell-sdk/pull/168) [`e5bb70890dc1c842d745f6818424372b6f15cf95`](https://github.com/moonwell-fi/moonwell-sdk/commit/e5bb70890dc1c842d745f6818424372b6f15cf95) Thanks [@bprofiro](https://github.com/bprofiro)! - add well, mamo and stkwell isolated markets

## 0.9.4

### Patch Changes

- [#166](https://github.com/moonwell-fi/moonwell-sdk/pull/166) [`8ae879d262657a97f34a5f6759edc39fbf8b4fef`](https://github.com/moonwell-fi/moonwell-sdk/commit/8ae879d262657a97f34a5f6759edc39fbf8b4fef) Thanks [@bprofiro](https://github.com/bprofiro)! - add new market - mMAMO

## 0.9.3

### Patch Changes

- [#164](https://github.com/moonwell-fi/moonwell-sdk/pull/164) [`28f7ba1232e24eade0d35f29e901c9b7528a5183`](https://github.com/moonwell-fi/moonwell-sdk/commit/28f7ba1232e24eade0d35f29e901c9b7528a5183) Thanks [@bprofiro](https://github.com/bprofiro)! - add new vault - meUSDC

## 0.9.2

### Patch Changes

- [#161](https://github.com/moonwell-fi/moonwell-sdk/pull/161) [`6ec3871a9d0e6f8dc9da8897e068439a9b37bb5a`](https://github.com/moonwell-fi/moonwell-sdk/commit/6ec3871a9d0e6f8dc9da8897e068439a9b37bb5a) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Fix build

## 0.9.1

### Patch Changes

- [#159](https://github.com/moonwell-fi/moonwell-sdk/pull/159) [`70a1e6e917c2862a0a60f62035b683585bbf8230`](https://github.com/moonwell-fi/moonwell-sdk/commit/70a1e6e917c2862a0a60f62035b683585bbf8230) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Add merkl stake rewards and apr

## 0.9.0

### Minor Changes

- [#157](https://github.com/moonwell-fi/moonwell-sdk/pull/157) [`b757408e9c288a75caa14d4ef61e6491787f5876`](https://github.com/moonwell-fi/moonwell-sdk/commit/b757408e9c288a75caa14d4ef61e6491787f5876) Thanks [@chimalsky](https://github.com/chimalsky)! - When one or more networks' RPC nodes are down, the SDK will still return responses from available RPC nodes to consumers.

## 0.8.9

### Patch Changes

- [#155](https://github.com/moonwell-fi/moonwell-sdk/pull/155) [`9f2260e159d1776514b44fbaa7f1e611fd0d068e`](https://github.com/moonwell-fi/moonwell-sdk/commit/9f2260e159d1776514b44fbaa7f1e611fd0d068e) Thanks [@x0s0l](https://github.com/x0s0l)! - Support fetching user voting power at proposal creation

## 0.8.8

### Patch Changes

- [#148](https://github.com/moonwell-fi/moonwell-sdk/pull/148) [`c423618778dc657bc65164e4853ffdf89998d69f`](https://github.com/moonwell-fi/moonwell-sdk/commit/c423618778dc657bc65164e4853ffdf89998d69f) Thanks [@avp1598](https://github.com/avp1598)! - Use gpg key signing for changeset actions

- [#151](https://github.com/moonwell-fi/moonwell-sdk/pull/151) [`613bc83c52eb96a51ec0732cff2dee714bc23459`](https://github.com/moonwell-fi/moonwell-sdk/commit/613bc83c52eb96a51ec0732cff2dee714bc23459) Thanks [@avp1598](https://github.com/avp1598)! - add signed commits on changesets release as well

- [#150](https://github.com/moonwell-fi/moonwell-sdk/pull/150) [`c5a6c9a3f62be68e22b1b9f373ecf20bf4fc3311`](https://github.com/moonwell-fi/moonwell-sdk/commit/c5a6c9a3f62be68e22b1b9f373ecf20bf4fc3311) Thanks [@avp1598](https://github.com/avp1598)! - Fix changesets action workflow

- [#153](https://github.com/moonwell-fi/moonwell-sdk/pull/153) [`35b46e6228746298f4fed7d64171de92f61de2a1`](https://github.com/moonwell-fi/moonwell-sdk/commit/35b46e6228746298f4fed7d64171de92f61de2a1) Thanks [@bprofiro](https://github.com/bprofiro)! - Fix snapshot proposals

## 0.8.7

### Patch Changes

- [#144](https://github.com/moonwell-fi/moonwell-sdk/pull/144) [`5ac34cc34afebb1128a63b10255d80b67407a72c`](https://github.com/moonwell-fi/moonwell-sdk/commit/5ac34cc34afebb1128a63b10255d80b67407a72c) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Deprecate isolated market PT-LBTC-29MAY2025

- [#147](https://github.com/moonwell-fi/moonwell-sdk/pull/147) [`688c1b3195d029f6a97f7fab35651a2bd80aae96`](https://github.com/moonwell-fi/moonwell-sdk/commit/688c1b3195d029f6a97f7fab35651a2bd80aae96) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Add staking rewards from merkl

- [#146](https://github.com/moonwell-fi/moonwell-sdk/pull/146) [`498c3a726843c336e564cdb30e80ed38929c5cfe`](https://github.com/moonwell-fi/moonwell-sdk/commit/498c3a726843c336e564cdb30e80ed38929c5cfe) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Add stake APY view for x28 proposal block

## 0.8.6

### Patch Changes

- [#142](https://github.com/moonwell-fi/moonwell-sdk/pull/142) [`048a75a35f1c000f9264e42b6c53385e78d3e902`](https://github.com/moonwell-fi/moonwell-sdk/commit/048a75a35f1c000f9264e42b6c53385e78d3e902) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Return pending staking rewards before execution of proposal x28 on base

## 0.8.5

### Patch Changes

- [#139](https://github.com/moonwell-fi/moonwell-sdk/pull/139) [`947a94f7b21c294fa484e8a0f6475b424bd1fb61`](https://github.com/moonwell-fi/moonwell-sdk/commit/947a94f7b21c294fa484e8a0f6475b424bd1fb61) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Fix APY for vault staking rewards

## 0.8.4

### Patch Changes

- [#137](https://github.com/moonwell-fi/moonwell-sdk/pull/137) [`ecaed128c5590e7a3ee83fa138a52420a7f964cf`](https://github.com/moonwell-fi/moonwell-sdk/commit/ecaed128c5590e7a3ee83fa138a52420a7f964cf) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Add claimableOnly parameter and reloadChain option to handle cache issues

- [#137](https://github.com/moonwell-fi/moonwell-sdk/pull/137) [`0888e68ef56c3e7807095ddc500b962204ba4865`](https://github.com/moonwell-fi/moonwell-sdk/commit/0888e68ef56c3e7807095ddc500b962204ba4865) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Fix Merkl endpoint and calculate claimable rewards

## 0.8.3

### Patch Changes

- [#134](https://github.com/moonwell-fi/moonwell-sdk/pull/134) [`e219440dea62cbf805e7a141e2199f29d24a67a2`](https://github.com/moonwell-fi/moonwell-sdk/commit/e219440dea62cbf805e7a141e2199f29d24a67a2) Thanks [@Leoakin43](https://github.com/Leoakin43)! - add parameter to filter rewards by current chain

- [#134](https://github.com/moonwell-fi/moonwell-sdk/pull/134) [`3ea1dd5ada18ae25a5319e0cb33341c0c9385321`](https://github.com/moonwell-fi/moonwell-sdk/commit/3ea1dd5ada18ae25a5319e0cb33341c0c9385321) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Fetch rewards from Merkl API

- [#134](https://github.com/moonwell-fi/moonwell-sdk/pull/134) [`36478bdca8e3011c0f6370622abb28fe08154085`](https://github.com/moonwell-fi/moonwell-sdk/commit/36478bdca8e3011c0f6370622abb28fe08154085) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Fix chain filter for rewards

## 0.8.2

### Patch Changes

- [#132](https://github.com/moonwell-fi/moonwell-sdk/pull/132) [`97f076894a9ee6e0754fa37f628ee4192c0b0480`](https://github.com/moonwell-fi/moonwell-sdk/commit/97f076894a9ee6e0754fa37f628ee4192c0b0480) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Change moonbeam rpc

## 0.8.1

### Patch Changes

- [#130](https://github.com/moonwell-fi/moonwell-sdk/pull/130) [`47dce3aae3c916288d08c272fb5466bc288c2690`](https://github.com/moonwell-fi/moonwell-sdk/commit/47dce3aae3c916288d08c272fb5466bc288c2690) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Updated content-type header in generic API cache request

- [#130](https://github.com/moonwell-fi/moonwell-sdk/pull/130) [`0bb80b0411565c531ce25f4db5954eda03bd9919`](https://github.com/moonwell-fi/moonwell-sdk/commit/0bb80b0411565c531ce25f4db5954eda03bd9919) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Updated RPC URL

## 0.8.0

### Minor Changes

- [#127](https://github.com/moonwell-fi/moonwell-sdk/pull/127) [`e1af835cf9e8984d58e2ebc22a4246004e21cda0`](https://github.com/moonwell-fi/moonwell-sdk/commit/e1af835cf9e8984d58e2ebc22a4246004e21cda0) Thanks [@x0s0l](https://github.com/x0s0l)! - Moonwell Beam - Deposit / Supply from multiple chains using Biconomy MEE and Across

## 0.7.11

### Patch Changes

- [#125](https://github.com/moonwell-fi/moonwell-sdk/pull/125) [`90bd92a22dc78f396617971d3b0c4de363382391`](https://github.com/moonwell-fi/moonwell-sdk/commit/90bd92a22dc78f396617971d3b0c4de363382391) Thanks [@hishboy](https://github.com/hishboy)! - Include User-Agent for only non-browser environment

## 0.7.10

### Patch Changes

- [#123](https://github.com/moonwell-fi/moonwell-sdk/pull/123) [`d93eba0e28b66c4e65bd28dfcf69d3f1a473365f`](https://github.com/moonwell-fi/moonwell-sdk/commit/d93eba0e28b66c4e65bd28dfcf69d3f1a473365f) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Added core market cbXRP

## 0.7.9

### Patch Changes

- [#120](https://github.com/moonwell-fi/moonwell-sdk/pull/120) [`4b801d3275fa20e5ef224cd71bf7ee5c4bdd7255`](https://github.com/moonwell-fi/moonwell-sdk/commit/4b801d3275fa20e5ef224cd71bf7ee5c4bdd7255) Thanks [@hishboy](https://github.com/hishboy)! - Fix morpho useragent/cloudflare issue

- [#122](https://github.com/moonwell-fi/moonwell-sdk/pull/122) [`ed5bb01d9853dec6f24ca127443089eed7b838cd`](https://github.com/moonwell-fi/moonwell-sdk/commit/ed5bb01d9853dec6f24ca127443089eed7b838cd) Thanks [@hishboy](https://github.com/hishboy)! - fix build

## 0.7.8

### Patch Changes

- [#118](https://github.com/moonwell-fi/moonwell-sdk/pull/118) [`86e6571b5a2ef1080941020174658e28b4ced27e`](https://github.com/moonwell-fi/moonwell-sdk/commit/86e6571b5a2ef1080941020174658e28b4ced27e) Thanks [@lyoungblood](https://github.com/lyoungblood)! - Fix Staking APR

## 0.7.7

### Patch Changes

- [#116](https://github.com/moonwell-fi/moonwell-sdk/pull/116) [`3caa1747d82ef4763514b0fe93c9b7908c0cbd20`](https://github.com/moonwell-fi/moonwell-sdk/commit/3caa1747d82ef4763514b0fe93c9b7908c0cbd20) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Fixed getMorphoVaults

## 0.7.6

### Patch Changes

- [#114](https://github.com/moonwell-fi/moonwell-sdk/pull/114) [`2b031407cd7a113c6766c3af6c58844c101d81b5`](https://github.com/moonwell-fi/moonwell-sdk/commit/2b031407cd7a113c6766c3af6c58844c101d81b5) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Added USDT0

## 0.7.5

### Patch Changes

- [#112](https://github.com/moonwell-fi/moonwell-sdk/pull/112) [`5b2c32412c53ed1654117619291cbb8b7c6dbc5f`](https://github.com/moonwell-fi/moonwell-sdk/commit/5b2c32412c53ed1654117619291cbb8b7c6dbc5f) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Added getMorphoVaultStakingSnapshots and total staked amount in vault

## 0.7.4

### Patch Changes

- [#110](https://github.com/moonwell-fi/moonwell-sdk/pull/110) [`dbb26f897a9b6a74a15d71e1d05880813175d30b`](https://github.com/moonwell-fi/moonwell-sdk/commit/dbb26f897a9b6a74a15d71e1d05880813175d30b) Thanks [@x0s0l](https://github.com/x0s0l)! - Add vault staking balance, rewards, and APR

## 0.7.3

### Patch Changes

- [#107](https://github.com/moonwell-fi/moonwell-sdk/pull/107) [`8a0d15acc529a01cda92d67ad8e8304d2b54aa49`](https://github.com/moonwell-fi/moonwell-sdk/commit/8a0d15acc529a01cda92d67ad8e8304d2b54aa49) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Fixed symbols for Moonwell tokens

- [#109](https://github.com/moonwell-fi/moonwell-sdk/pull/109) [`00b3779bfbaae066b24da48fc9e7ff1bc57f44e7`](https://github.com/moonwell-fi/moonwell-sdk/commit/00b3779bfbaae066b24da48fc9e7ff1bc57f44e7) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Added Morpho market

## 0.7.2

### Patch Changes

- Fix liquidity logic on isolated market snapshots

## 0.7.1

### Patch Changes

- [#103](https://github.com/moonwell-fi/moonwell-sdk/pull/103) [`8d6299bcacea48bf2b36bbd0cf4e935e277c1bdd`](https://github.com/moonwell-fi/moonwell-sdk/commit/8d6299bcacea48bf2b36bbd0cf4e935e277c1bdd) Thanks [@x0s0l](https://github.com/x0s0l)! - Add USD values in Isolated Markets Snapshots

## 0.7.0

### Minor Changes

- [#101](https://github.com/moonwell-fi/moonwell-sdk/pull/101) [`da8578932115644ca5e61e6310c23116b50cf842`](https://github.com/moonwell-fi/moonwell-sdk/commit/da8578932115644ca5e61e6310c23116b50cf842) Thanks [@x0s0l](https://github.com/x0s0l)! - Add support for multichain Morpho Markets and Vaults

## 0.6.2

### Patch Changes

- [#97](https://github.com/moonwell-fi/moonwell-sdk/pull/97) [`e7dbd9f1a84d97cba47420cc0db9a99740312be4`](https://github.com/moonwell-fi/moonwell-sdk/commit/e7dbd9f1a84d97cba47420cc0db9a99740312be4) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Bumped viem package version

## 0.6.1

### Patch Changes

- [#95](https://github.com/moonwell-fi/moonwell-sdk/pull/95) [`cf55ae56d910262a9a2ee6db713536add7e8a798`](https://github.com/moonwell-fi/moonwell-sdk/commit/cf55ae56d910262a9a2ee6db713536add7e8a798) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Renamed Optimism network

## 0.6.0

### Minor Changes

- [#92](https://github.com/moonwell-fi/moonwell-sdk/pull/92) [`1f88517766cb5d04da8887c4fc8efb1e8437e02e`](https://github.com/moonwell-fi/moonwell-sdk/commit/1f88517766cb5d04da8887c4fc8efb1e8437e02e) Thanks [@x0s0l](https://github.com/x0s0l)! - Separate indexer url for governance

## 0.5.27

### Patch Changes

- [#90](https://github.com/moonwell-fi/moonwell-sdk/pull/90) [`3b1cc6f16ca563c36ec3f9c9f03a25bd46cde69b`](https://github.com/moonwell-fi/moonwell-sdk/commit/3b1cc6f16ca563c36ec3f9c9f03a25bd46cde69b) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Fixed decimal configuration for PT_LBTC_29MAY2025

## 0.5.26

### Patch Changes

- [#88](https://github.com/moonwell-fi/moonwell-sdk/pull/88) [`ce517c3fe1da6db5d931a77193b589b558a487d2`](https://github.com/moonwell-fi/moonwell-sdk/commit/ce517c3fe1da6db5d931a77193b589b558a487d2) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Fixed rewards supply and changed API cache time

## 0.5.25

### Patch Changes

- [#86](https://github.com/moonwell-fi/moonwell-sdk/pull/86) [`f627e3d32e82a7960bf9906e4bbfc85099f45d44`](https://github.com/moonwell-fi/moonwell-sdk/commit/f627e3d32e82a7960bf9906e4bbfc85099f45d44) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Added VIRTUALS market

- [#86](https://github.com/moonwell-fi/moonwell-sdk/pull/86) [`4c093c47cb4ca69ac93f821e5e433d940e5ab99f`](https://github.com/moonwell-fi/moonwell-sdk/commit/4c093c47cb4ca69ac93f821e5e433d940e5ab99f) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Added handling for division by zero in getMarketsData

## 0.5.24

### Patch Changes

- [#84](https://github.com/moonwell-fi/moonwell-sdk/pull/84) [`4b0b3719e53c80bac1d1d7ae43fd161c5e7af834`](https://github.com/moonwell-fi/moonwell-sdk/commit/4b0b3719e53c80bac1d1d7ae43fd161c5e7af834) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Renamed bBTC and USDS

## 0.5.23

### Patch Changes

- [#82](https://github.com/moonwell-fi/moonwell-sdk/pull/82) [`ac84fe42756dae63d1815ed529394bdab4798b40`](https://github.com/moonwell-fi/moonwell-sdk/commit/ac84fe42756dae63d1815ed529394bdab4798b40) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Added USDS, LBTC, and TBTC markets

## 0.5.22

### Patch Changes

- [#80](https://github.com/moonwell-fi/moonwell-sdk/pull/80) [`50b52e21c445de918ac18ea152545cd83e615d6e`](https://github.com/moonwell-fi/moonwell-sdk/commit/50b52e21c445de918ac18ea152545cd83e615d6e) Thanks [@x0s0l](https://github.com/x0s0l)! - Fix market snapshots

## 0.5.21

### Patch Changes

- [#78](https://github.com/moonwell-fi/moonwell-sdk/pull/78) [`63e0d41365fbb0839275c9436e4df2a399fb00e7`](https://github.com/moonwell-fi/moonwell-sdk/commit/63e0d41365fbb0839275c9436e4df2a399fb00e7) Thanks [@x0s0l](https://github.com/x0s0l)! - Add token price to market snapshots

## 0.5.20

### Patch Changes

- [#76](https://github.com/moonwell-fi/moonwell-sdk/pull/76) [`1253c6505b872a0ba81651acacf9a9457adc58e0`](https://github.com/moonwell-fi/moonwell-sdk/commit/1253c6505b872a0ba81651acacf9a9457adc58e0) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Added LBTC-cbBTC market

- [#76](https://github.com/moonwell-fi/moonwell-sdk/pull/76) [`adc7f3862cedf4bd54af0f993af5ae96f08ae798`](https://github.com/moonwell-fi/moonwell-sdk/commit/adc7f3862cedf4bd54af0f993af5ae96f08ae798) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Renamed token well to Moonwell

## 0.5.19

### Patch Changes

- [#74](https://github.com/moonwell-fi/moonwell-sdk/pull/74) [`0fcd0d5daf26faa07451a1e25980ab853570b96a`](https://github.com/moonwell-fi/moonwell-sdk/commit/0fcd0d5daf26faa07451a1e25980ab853570b96a) Thanks [@x0s0l](https://github.com/x0s0l)! - Fix build

- [#74](https://github.com/moonwell-fi/moonwell-sdk/pull/74) [`e5b6526f295f8f0c668e3fe33300db471c65dcb2`](https://github.com/moonwell-fi/moonwell-sdk/commit/e5b6526f295f8f0c668e3fe33300db471c65dcb2) Thanks [@x0s0l](https://github.com/x0s0l)! - Add WELL Market on Base

## 0.5.18

### Patch Changes

- [#72](https://github.com/moonwell-fi/moonwell-sdk/pull/72) [`6f1b9ad8c004fc42b0364d171326599025900a76`](https://github.com/moonwell-fi/moonwell-sdk/commit/6f1b9ad8c004fc42b0364d171326599025900a76) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Changed cbBTC name

## 0.5.17

### Patch Changes

- [#70](https://github.com/moonwell-fi/moonwell-sdk/pull/70) [`41605a539d6c1d3d6105b52be95f4c427181cdc1`](https://github.com/moonwell-fi/moonwell-sdk/commit/41605a539d6c1d3d6105b52be95f4c427181cdc1) Thanks [@x0s0l](https://github.com/x0s0l)! - Fix PT Lombard LBTC 29MAY2025 symbol and collateral price logic

## 0.5.16

### Patch Changes

- [#68](https://github.com/moonwell-fi/moonwell-sdk/pull/68) [`fc6d199f49d3001d17866b8aa820de20bd339f83`](https://github.com/moonwell-fi/moonwell-sdk/commit/fc6d199f49d3001d17866b8aa820de20bd339f83) Thanks [@x0s0l](https://github.com/x0s0l)! - Fix build

## 0.5.15

### Patch Changes

- [#64](https://github.com/moonwell-fi/moonwell-sdk/pull/64) [`1dc4db89da946e062e7d378fa5c2904aec9d6562`](https://github.com/moonwell-fi/moonwell-sdk/commit/1dc4db89da946e062e7d378fa5c2904aec9d6562) Thanks [@x0s0l](https://github.com/x0s0l)! - Add LBTC-CBBTC Morpho Market

## 0.5.14

### Patch Changes

- [#61](https://github.com/moonwell-fi/moonwell-sdk/pull/61) [`f475d3774246d3678eb3c819cb1aa58bbad2ea35`](https://github.com/moonwell-fi/moonwell-sdk/commit/f475d3774246d3678eb3c819cb1aa58bbad2ea35) Thanks [@x0s0l](https://github.com/x0s0l)! - Use local sdk instead of published one

- [#57](https://github.com/moonwell-fi/moonwell-sdk/pull/57) [`11fe28e6dbe122eca4fead5213bb10d0071184c0`](https://github.com/moonwell-fi/moonwell-sdk/commit/11fe28e6dbe122eca4fead5213bb10d0071184c0) Thanks [@x0s0l](https://github.com/x0s0l)! - Add Moonwell Frontier cbBTC Vault

- [#59](https://github.com/moonwell-fi/moonwell-sdk/pull/59) [`7a70e4021756fd3cfda7a9112d37311929bdc154`](https://github.com/moonwell-fi/moonwell-sdk/commit/7a70e4021756fd3cfda7a9112d37311929bdc154) Thanks [@x0s0l](https://github.com/x0s0l)! - Fix docs site build

## 0.5.13

### Patch Changes

- [#53](https://github.com/moonwell-fi/moonwell-sdk/pull/53) [`09604ff8f13f7e326e47914d7e337d1fe76161ab`](https://github.com/moonwell-fi/moonwell-sdk/commit/09604ff8f13f7e326e47914d7e337d1fe76161ab) Thanks [@x0s0l](https://github.com/x0s0l)! - Add borrow apy and supply apy to markets snapshots

## 0.5.12

### Patch Changes

- [#51](https://github.com/moonwell-fi/moonwell-sdk/pull/51) [`23b021afea636c39e865abbdad6d4d956b24844a`](https://github.com/moonwell-fi/moonwell-sdk/commit/23b021afea636c39e865abbdad6d4d956b24844a) Thanks [@x0s0l](https://github.com/x0s0l)! - Add Morpho Vault User Position Snapshots

## 0.5.11

### Patch Changes

- [#49](https://github.com/moonwell-fi/moonwell-sdk/pull/49) [`ad563c55f115523c7cf877c5c3240ee9228ea749`](https://github.com/moonwell-fi/moonwell-sdk/commit/ad563c55f115523c7cf877c5c3240ee9228ea749) Thanks [@x0s0l](https://github.com/x0s0l)! - Add bad debt

## 0.5.10

### Patch Changes

- [#47](https://github.com/moonwell-fi/moonwell-sdk/pull/47) [`04f6f9c5824a8f6d7e2bab9fc440730dff21b2d4`](https://github.com/moonwell-fi/moonwell-sdk/commit/04f6f9c5824a8f6d7e2bab9fc440730dff21b2d4) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Renamed KelpDAO and Velodrome on Optimism

- [#47](https://github.com/moonwell-fi/moonwell-sdk/pull/47) [`f138c1c21be7ba033bdcb67e97b45b1b5289c658`](https://github.com/moonwell-fi/moonwell-sdk/commit/f138c1c21be7ba033bdcb67e97b45b1b5289c658) Thanks [@Leoakin43](https://github.com/Leoakin43)! - Renamed DAI on Base and Optimism

## 0.5.9

### Patch Changes

- [#45](https://github.com/moonwell-fi/moonwell-sdk/pull/45) [`cf6631b1125800287013a2cffb3a1eac23d2fd95`](https://github.com/moonwell-fi/moonwell-sdk/commit/cf6631b1125800287013a2cffb3a1eac23d2fd95) Thanks [@x0s0l](https://github.com/x0s0l)! - Add safecheck for window object

## 0.5.8

### Patch Changes

- [#43](https://github.com/moonwell-fi/moonwell-sdk/pull/43) [`7869645bda66b207a19df6d53cfe6b048e5ea580`](https://github.com/moonwell-fi/moonwell-sdk/commit/7869645bda66b207a19df6d53cfe6b048e5ea580) Thanks [@x0s0l](https://github.com/x0s0l)! - Add dayjs dependency

## 0.5.7

### Patch Changes

- [#40](https://github.com/moonwell-fi/moonwell-sdk/pull/40) [`e78a2d11995dec7b5260112a8caa168e751871fe`](https://github.com/moonwell-fi/moonwell-sdk/commit/e78a2d11995dec7b5260112a8caa168e751871fe) Thanks [@x0s0l](https://github.com/x0s0l)! - Add cbBTC isolated markets

- [#42](https://github.com/moonwell-fi/moonwell-sdk/pull/42) [`84cf0a5c9eb1a06f07d93429627da98ccfb720d7`](https://github.com/moonwell-fi/moonwell-sdk/commit/84cf0a5c9eb1a06f07d93429627da98ccfb720d7) Thanks [@x0s0l](https://github.com/x0s0l)! - Add isolated cbBTC markets

## 0.5.6

### Patch Changes

- [#38](https://github.com/moonwell-fi/moonwell-sdk/pull/38) [`e7d5c4c52ed91514a1ec6a9aea46fecd30f565b7`](https://github.com/moonwell-fi/moonwell-sdk/commit/e7d5c4c52ed91514a1ec6a9aea46fecd30f565b7) Thanks [@x0s0l](https://github.com/x0s0l)! - Deprecate USDbC market

## 0.5.5

### Patch Changes

- [#36](https://github.com/moonwell-fi/moonwell-sdk/pull/36) [`fd4a570de0bf19315a77f89c47c07c67b952f4ac`](https://github.com/moonwell-fi/moonwell-sdk/commit/fd4a570de0bf19315a77f89c47c07c67b952f4ac) Thanks [@x0s0l](https://github.com/x0s0l)! - Fix USDC.wh name and decimals

## 0.5.4

### Patch Changes

- [#34](https://github.com/moonwell-fi/moonwell-sdk/pull/34) [`6eeef06759878d1ae19797a8159a791e2d83dba3`](https://github.com/moonwell-fi/moonwell-sdk/commit/6eeef06759878d1ae19797a8159a791e2d83dba3) Thanks [@x0s0l](https://github.com/x0s0l)! - Fix delegates API

## 0.5.3

### Patch Changes

- [#32](https://github.com/moonwell-fi/moonwell-sdk/pull/32) [`01d81aa4facd36a8b0bea85caf8ec19bba5d7c57`](https://github.com/moonwell-fi/moonwell-sdk/commit/01d81aa4facd36a8b0bea85caf8ec19bba5d7c57) Thanks [@x0s0l](https://github.com/x0s0l)! - Add chainId to proposal state changes

## 0.5.2

### Patch Changes

- [#29](https://github.com/moonwell-fi/moonwell-sdk/pull/29) [`c59a735f61f5c715076917230c4b1ba62a65e01d`](https://github.com/moonwell-fi/moonwell-sdk/commit/c59a735f61f5c715076917230c4b1ba62a65e01d) Thanks [@x0s0l](https://github.com/x0s0l)! - Fix build

## 0.5.1

### Patch Changes

- [#27](https://github.com/moonwell-fi/moonwell-sdk/pull/27) [`b67ea127df5913adc129abc33e79da2700f4b1f8`](https://github.com/moonwell-fi/moonwell-sdk/commit/b67ea127df5913adc129abc33e79da2700f4b1f8) Thanks [@x0s0l](https://github.com/x0s0l)! - Change wstETH APY

- [#27](https://github.com/moonwell-fi/moonwell-sdk/pull/27) [`7968c02ea09e4b8d071d4a41607b774d66479736`](https://github.com/moonwell-fi/moonwell-sdk/commit/7968c02ea09e4b8d071d4a41607b774d66479736) Thanks [@x0s0l](https://github.com/x0s0l)! - Fixed rETH Apy and Aerodrome name

## 0.5.0

### Minor Changes

- [#24](https://github.com/moonwell-fi/moonwell-sdk/pull/24) [`471622015298aa5613065e73d8f242230fdce2fe`](https://github.com/moonwell-fi/moonwell-sdk/commit/471622015298aa5613065e73d8f242230fdce2fe) Thanks [@x0s0l](https://github.com/x0s0l)! - Add Liquid Staking APR to markets

## 0.4.4

### Patch Changes

- [#22](https://github.com/moonwell-fi/moonwell-sdk/pull/22) [`6a42f5ed95183a392c7b64abd127adf977e6758d`](https://github.com/moonwell-fi/moonwell-sdk/commit/6a42f5ed95183a392c7b64abd127adf977e6758d) Thanks [@x0s0l](https://github.com/x0s0l)! - Add user position snapshots

## 0.4.3

### Patch Changes

- [#19](https://github.com/moonwell-fi/moonwell-sdk/pull/19) [`2fe6473c22390a3d38e4ff01d926054d644bacbf`](https://github.com/moonwell-fi/moonwell-sdk/commit/2fe6473c22390a3d38e4ff01d926054d644bacbf) Thanks [@x0s0l](https://github.com/x0s0l)! - Fix another file using lodash

## 0.4.2

### Patch Changes

- [#16](https://github.com/moonwell-fi/moonwell-sdk/pull/16) [`3bd4c9df75a30b8f97308d12ffc6476e2d7911ca`](https://github.com/moonwell-fi/moonwell-sdk/commit/3bd4c9df75a30b8f97308d12ffc6476e2d7911ca) Thanks [@x0s0l](https://github.com/x0s0l)! - Fix other files using lodash

## 0.4.1

### Patch Changes

- [#13](https://github.com/moonwell-fi/moonwell-sdk/pull/13) [`3d2127f8efe3c646788c4c82b95417bff848551a`](https://github.com/moonwell-fi/moonwell-sdk/commit/3d2127f8efe3c646788c4c82b95417bff848551a) Thanks [@x0s0l](https://github.com/x0s0l)! - Change lodash import

## 0.4.0

### Minor Changes

- [#11](https://github.com/moonwell-fi/moonwell-sdk/pull/11) [`214d8ba474451838c9ddb3b0d5b03b563673be74`](https://github.com/moonwell-fi/moonwell-sdk/commit/214d8ba474451838c9ddb3b0d5b03b563673be74) Thanks [@x0s0l](https://github.com/x0s0l)! - Add Morpho Vault Snapshots

## 0.3.2

### Patch Changes

- [`6a3fe3f5100332623672e8713eda1c26c1714e46`](https://github.com/moonwell-fi/moonwell-sdk/commit/6a3fe3f5100332623672e8713eda1c26c1714e46) Thanks [@x0s0l](https://github.com/x0s0l)! - Remove tests

## 0.3.1

### Patch Changes

- [`f7c370d7da317a775ed40587ecc0dde892645058`](https://github.com/moonwell-fi/moonwell-sdk/commit/f7c370d7da317a775ed40587ecc0dde892645058) Thanks [@x0s0l](https://github.com/x0s0l)! - Fix building scripts

## 0.3.0

### Minor Changes

- [`cf80623bdd5940efe186d4e2bc65d73d7375aeb7`](https://github.com/moonwell-fi/moonwell-sdk/commit/cf80623bdd5940efe186d4e2bc65d73d7375aeb7) Thanks [@x0s0l](https://github.com/x0s0l)! - add usdc anywhere definitions

### Patch Changes

- [`0c627ca3d56940244bc483d1e97791c8b8537a66`](https://github.com/moonwell-fi/moonwell-sdk/commit/0c627ca3d56940244bc483d1e97791c8b8537a66) Thanks [@x0s0l](https://github.com/x0s0l)! - Adding missing types and properties

## 0.2.1

### Patch Changes

- [`e4ee9380da244b11e966e2614392f0285dc45cfb`](https://github.com/moonwell-fi/moonwell-sdk/commit/e4ee9380da244b11e966e2614392f0285dc45cfb) Thanks [@x0s0l](https://github.com/x0s0l)! - Add environment key prop

## 0.2.0

### Minor Changes

- [`b199e6cf81432bee0bd1681a079a41054a7a4645`](https://github.com/moonwell-fi/moonwell-sdk/commit/b199e6cf81432bee0bd1681a079a41054a7a4645) Thanks [@x0s0l](https://github.com/x0s0l)! - Drop args requirement for getProposals and getSnapshotProposals methods

## 0.1.0

### Minor Changes

- [`e3952fc8f0c283002a9c2bc711be56d143bf1a60`](https://github.com/moonwell-fi/moonwell-sdk/commit/e3952fc8f0c283002a9c2bc711be56d143bf1a60) Thanks [@x0s0l](https://github.com/x0s0l)! - Add README file
