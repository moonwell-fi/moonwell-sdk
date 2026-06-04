import axios from "axios";
import last from "lodash/last.js";
import { moonriver } from "viem/chains";
import { Amount } from "../../../common/index.js";
import type { Environment } from "../../../environments/index.js";
import { publicEnvironments } from "../../../environments/index.js";
import {
  MultichainProposalState,
  MultichainProposalStateMapping,
  type Proposal,
  ProposalState,
} from "../../../types/proposal.js";
import { postWithRetry } from "../../axiosWithRetry.js";
import type { ApiProposal } from "../governor-api-client.js";

export const WORMHOLE_CONTRACT = "0xc8e2b0cd52cf01b0ce87d389daa3d414d4ce29f3"; // Moonbeam

// Wormhole Core Bridge addresses for chains that can host the multichain
// governance hub. Moonbeam was the historical hub; Ethereum is the current
// multigov hub. Either chain's bridge in a proposal's targets signals a
// multichain proposal. Entries MUST be lowercase — `isMultichainProposal`
// lowercases the proposal target once and looks the entry up directly.
const MULTICHAIN_WORMHOLE_BRIDGES: ReadonlySet<string> = new Set([
  WORMHOLE_CONTRACT,
  "0x98f3c9e6e3face36baad05fe09d375ef1464288b", // Ethereum
]);

type PonderExtendedProposalData = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  targets: string[];
  calldatas: string[];
  signatures: string[];
  stateChanges: {
    blockNumber: number;
    transactionHash: string;
    state: string;
  }[];
};

axios.defaults.timeout = 5_000;

/**
 * Extract proposal subtitle from description
 */
export const extractProposalSubtitle = (input: string): string => {
  const lines = input.split("\n");
  const h1Line = lines.find((line) => line.startsWith("#"));

  if (!h1Line) {
    return input ? input.substring(0, 100) : "";
  }

  let result = h1Line.substring(1).trim();
  const h2Index = result.indexOf("##");
  if (h2Index !== -1) {
    result = result.substring(0, h2Index).trim();
  }

  result = result.replace(/\\n/g, "").trim();

  if (result.length > 80) {
    result = `${result.substring(0, 80)}...`;
  }

  // Special cases for proposals that don't follow the standard naming convention
  if (result.includes("Moonbeam")) {
    result = result.replace("MIP-B", "MIP-M");
  }

  if (result.indexOf("MIP-B22: Gauntlet") >= 0) {
    result = result.replace("MIP-B22", "MIP-B24");
  }

  if (result.indexOf("MIP-O01: Gauntlet") >= 0) {
    result = result.replace("MIP-O01", "MIP-O03");
  }

  if (result.indexOf("MIP-M02: Upgrade") >= 0) {
    result = result.replace("MIP-M02", "MIP-M03");
  }

  if (result.indexOf("MIP-R02: Upgrade") >= 0) {
    result = result.replace("MIP-R02", "MIP-R03");
  }

  if (result.indexOf("Proposal: Onboard wstETH") >= 0) {
    result = result.replace("Proposal:", "MIP-B08");
  }

  if (
    result.indexOf("Gauntlet's Moonriver Recommendations (2024-01-09)") >= 0
  ) {
    result = result.replace("Gauntlet", "MIP-R10: Gauntlet");
  }

  return result;
};

/**
 * Detects whether a proposal SENDS a cross-chain message, by checking whether
 * any of its targets is a Wormhole Core Bridge on a known multichain-governance
 * hub (Moonbeam or Ethereum).
 *
 * WARNING: this is NOT sufficient to classify a proposal as belonging to the
 * multichain governor. Hub-local proposals (created on the Ethereum
 * MultichainGovernor with only same-chain targets) never message a bridge and
 * return `false` here — misclassifying them broke voting on proposal 171
 * (June 2026). Use `classifyProposalMultichain` for governor classification.
 */
export const isMultichainProposal = (targets?: string[]): boolean =>
  targets?.some((t) => MULTICHAIN_WORMHOLE_BRIDGES.has(t.toLowerCase())) ??
  false;

/**
 * True when `chainId`'s environment is a multichain-governance hub with no
 * legacy governor lineage (Ethereum: `multichainGovernor` only, no Artemis
 * predecessor). On such a chain every proposal belongs to the multichain
 * governor by construction — what the proposal targets is irrelevant.
 */
export const isMultichainHomeChain = (chainId: number): boolean => {
  const env = getEnvironmentByChainId(chainId);
  return Boolean(env?.contracts.multichainGovernor && !env.contracts.governor);
};

/**
 * Canonical multichain classification for a proposal — the single entry point
 * used by `getProposal`, `getProposals`, and on-chain-data routing so the
 * paths cannot drift. A proposal belongs to the multichain governor when:
 *   1. it is homed on a hub chain with no legacy governor (every Ethereum-hub
 *      proposal, including hub-local ones with no bridge target), OR
 *   2. its targets include a Wormhole Core Bridge (legacy detection), OR
 *   3. its proposalId is past the legacy Artemis governor's `proposalCount`
 *      (Moonbeam-hub-era proposals with local-only targets), OR
 *   4. the Artemis cutoff is unknown because the read failed (`undefined`) — we
 *      bias to multichain rather than risk routing a live proposal to the dead
 *      Artemis governor (the proposal-171 root cause, on Moonbeam).
 *
 * `legacyArtemisMaxId` is only meaningful for Moonbeam-homed proposals. Pass 0
 * for chains with no legacy governor — the ID check is N/A and classification
 * falls back to the home/bridge checks. Omit it or pass `undefined` when the
 * count read failed so the unknown-cutoff bias above applies. (No `= 0` default:
 * that would coerce an explicit `undefined` back to 0 and defeat the bias.)
 */
export const classifyProposalMultichain = (
  proposal: { targets?: string[]; proposalId: number; chainId: number },
  legacyArtemisMaxId?: number,
): boolean =>
  isMultichainHomeChain(proposal.chainId) ||
  isMultichainProposal(proposal.targets) ||
  legacyArtemisMaxId === undefined ||
  (legacyArtemisMaxId > 0 && proposal.proposalId > legacyArtemisMaxId);

/**
 * @deprecated Use `classifyProposalMultichain` — this variant misses hub-homed
 * proposals when the Artemis count is unavailable. Kept for compatibility.
 */
export const isMultichainAware = (
  proposal: { targets?: string[]; proposalId: number },
  legacyArtemisMaxId: number,
): boolean =>
  isMultichainProposal(proposal.targets) ||
  (legacyArtemisMaxId > 0 && proposal.proposalId > legacyArtemisMaxId);

export type ApiProposalFormatted = {
  forVotes: Amount;
  againstVotes: Amount;
  abstainVotes: Amount;
  totalVotes: Amount;
  canceled: boolean;
  executed: boolean;
  stateChanges: Array<{
    blockNumber: number;
    transactionHash: string;
    state: string;
    chainId: number;
  }>;
  title: string;
  subtitle: string;
};

/**
 * Derive a ProposalState value from API data alone (no on-chain read).
 *
 * Used for proposals whose chainId doesn't match the governance environment's
 * chainId — e.g. chainId=1 (Ethereum multigov) proposals reached through the
 * Moonbeam governance environment, where on-chain reads against Moonbeam's
 * governor would be meaningless.
 *
 * Precedence (highest wins): Executed → Canceled → Queued → Active → Pending.
 * Executed wins over Canceled because the SDK treats EXECUTED state changes as
 * the terminal truth even when an earlier CANCELED event is present.
 */
export const deriveProposalStateFromApi = (
  formatted: ApiProposalFormatted,
  apiProposal: ApiProposal,
  now: number,
): ProposalState => {
  if (formatted.executed) return ProposalState.Executed;
  if (formatted.canceled) return ProposalState.Canceled;
  const hasQueued = apiProposal.stateChanges?.some(
    (sc) => sc.state === "QUEUED",
  );
  if (hasQueued) return ProposalState.Queued;
  if (now >= apiProposal.votingStartTime && now <= apiProposal.votingEndTime) {
    return ProposalState.Active;
  }
  return ProposalState.Pending;
};

/**
 * Parses and formats API proposal data
 */
export const formatApiProposalData = (
  apiProposal: ApiProposal,
): ApiProposalFormatted => {
  const forVotesNum = Number(apiProposal.forVotes);
  const againstVotesNum = Number(apiProposal.againstVotes);
  const abstainVotesNum = Number(apiProposal.abstainVotes);

  const forVotes = new Amount(BigInt(Math.floor(forVotesNum * 1e18)), 18);
  const againstVotes = new Amount(
    BigInt(Math.floor(againstVotesNum * 1e18)),
    18,
  );
  const abstainVotes = new Amount(
    BigInt(Math.floor(abstainVotesNum * 1e18)),
    18,
  );

  const totalVotesValue = forVotesNum + againstVotesNum + abstainVotesNum;
  const totalVotes = new Amount(BigInt(Math.floor(totalVotesValue * 1e18)), 18);

  const canceled =
    apiProposal.stateChanges?.some((sc: any) => sc.state === "CANCELED") ??
    false;
  const executed =
    apiProposal.stateChanges?.some((sc: any) => sc.state === "EXECUTED") ??
    false;

  // IMPORTANT: Use sc.chainId from the state change, not apiProposal.chainId
  // This preserves cross-chain events (e.g., QUEUED/EXECUTED on Base with chainId 8453)
  const stateChanges =
    apiProposal.stateChanges?.map((sc: any) => ({
      blockNumber: Number(sc.blockNumber),
      transactionHash: sc.transactionHash,
      state: sc.state,
      chainId: sc.chainId, // Uses the chainId from the state change itself
      timestamp: sc.timestamp !== undefined ? Number(sc.timestamp) : undefined,
    })) || [];

  const subtitle = extractProposalSubtitle(apiProposal.description);
  const title = `Proposal #${apiProposal.proposalId}`;

  return {
    forVotes,
    againstVotes,
    abstainVotes,
    totalVotes,
    canceled,
    executed,
    stateChanges,
    title,
    subtitle,
  };
};

export type ProposalOnChainData = {
  state: number;
  proposalData: any;
  eta: number;
  votesCollected: boolean;
  quorum: bigint;
  /**
   * Canonical multichain classification, computed here with the caller env's
   * Artemis cutoff. Returned so `getProposal`/`getProposals` consume it instead
   * of re-running `classifyProposalMultichain` (which, without the cutoff,
   * misses Moonbeam-homed local-target proposals and drifts from this routing).
   */
  isMultichain: boolean;
};

// Cached per chain: highest proposalId held by the legacy Artemis governor.
// Anything with a higher proposalId belongs to the multichain governor, even
// if its targets don't include the Wormhole bridge. The legacy governor only
// receives new proposals during chain migrations, so a 5-minute TTL is plenty.
const LEGACY_ARTEMIS_MAX_ID_TTL_MS = 5 * 60 * 1000;
const legacyArtemisMaxIdCache = new Map<
  number,
  { value: number; fetchedAt: number }
>();

const getLegacyArtemisMaxId = async (
  governanceEnvironment: Environment,
): Promise<number | undefined> => {
  const governor = governanceEnvironment.contracts.governor;
  if (!governor) return 0;

  const cached = legacyArtemisMaxIdCache.get(governanceEnvironment.chainId);
  if (cached && Date.now() - cached.fetchedAt < LEGACY_ARTEMIS_MAX_ID_TTL_MS) {
    return cached.value;
  }

  try {
    const value = Number(await governor.read.proposalCount());
    legacyArtemisMaxIdCache.set(governanceEnvironment.chainId, {
      value,
      fetchedAt: Date.now(),
    });
    return value;
  } catch (error) {
    console.warn("Failed to fetch legacy governor proposalCount:", error);
    // A cold-cache read failure must NOT collapse to 0. On a dual-governor
    // chain (Moonbeam) that would make a live multichain proposal with
    // local-only targets look like a pre-cutoff legacy proposal and route its
    // votes to the dead Artemis governor — the proposal-171 root cause. Return
    // a stale cached cutoff if we have one, otherwise `undefined` (unknown) so
    // `classifyProposalMultichain` biases to the multichain governor instead.
    return cached?.value;
  }
};

/**
 * Reads the multichain governor's quorum on every chain that holds an active
 * proposal but isn't the one we'd normally read through. Returns a chainId →
 * quorum map; chains with no `multichainGovernor` wired are omitted, as are
 * chains whose quorum read reverted. Callers substitute `0n` for misses via
 * the `options.crossChainQuorums?.get(...) ?? 0n` pattern.
 *
 * Read failures are routed through `onError` so Sentry-wired consumers see
 * them — matching `getProposalData` / `getCrossChainProposalData` /
 * `getExtendedProposalData`. The caller's `governanceEnvironment` carries
 * `onError` since we don't have one per foreign chain in scope.
 */
export const getEnvironmentByChainId = (
  chainId: number,
): Environment | undefined =>
  (Object.values(publicEnvironments) as Environment[]).find(
    (e) => e.chainId === chainId,
  );

export const readCrossChainQuorums = async (
  apiProposals: ApiProposal[],
  governanceEnvironment: Environment,
): Promise<Map<number, bigint>> => {
  const otherChainIds = Array.from(
    new Set(
      apiProposals
        .map((p) => p.chainId)
        .filter((c) => c !== governanceEnvironment.chainId),
    ),
  );
  const quorums = new Map<number, bigint>();
  await Promise.all(
    otherChainIds.map(async (chainId) => {
      const env = getEnvironmentByChainId(chainId);
      const mg = env?.contracts.multichainGovernor;
      if (!mg) return;
      try {
        quorums.set(chainId, await mg.read.quorum());
      } catch (error) {
        console.warn(
          `[readCrossChainQuorums] quorum read failed for chainId=${chainId}:`,
          error,
        );
        governanceEnvironment.onError?.(error, {
          source: "governance-cross-chain-quorum",
          chainId,
        });
      }
    }),
  );
  return quorums;
};

/**
 * Fetches on-chain data for multiple proposals
 */
export const getProposalsOnChainData = async (
  apiProposals: ApiProposal[],
  governanceEnvironment: Environment,
  options?: { crossChainQuorums?: Map<number, bigint> },
): Promise<ProposalOnChainData[]> => {
  let quorum = 0n;

  if (governanceEnvironment.contracts.governor) {
    try {
      quorum =
        governanceEnvironment.chainId === 1284
          ? await governanceEnvironment.contracts.governor.read.quorumVotes()
          : await governanceEnvironment.contracts.governor.read.getQuorum();
    } catch (error) {
      console.warn("Failed to fetch quorum:", error);
    }
  }

  const legacyArtemisMaxId = await getLegacyArtemisMaxId(governanceEnvironment);

  const nowSeconds = Math.floor(Date.now() / 1000);

  // Foreign proposals (chainId !== caller's) need their own home env's
  // governor — the caller's RPC can't read them. Falls back to publicEnvironments.
  const resolveHomeEnv = (chainId: number): Environment | undefined =>
    chainId === governanceEnvironment.chainId
      ? governanceEnvironment
      : getEnvironmentByChainId(chainId);

  const onChainDataList = await Promise.all(
    apiProposals.map(async (p) => {
      const isLocal = p.chainId === governanceEnvironment.chainId;
      const proposalQuorum = isLocal
        ? quorum
        : (options?.crossChainQuorums?.get(p.chainId) ?? 0n);
      const homeEnv = resolveHomeEnv(p.chainId);

      // legacyArtemisMaxId is meaningful only for the caller's env — it's the
      // Moonbeam Artemis cap; pass 0 for foreign envs. Hub-homed proposals
      // (Ethereum multigov, no Artemis predecessor) classify as multichain
      // regardless of targets via classifyProposalMultichain. Computed once
      // here and returned on ProposalOnChainData so callers don't re-classify
      // and drift (see getProposal/getProposals).
      const isMultichain = classifyProposalMultichain(
        p,
        isLocal ? legacyArtemisMaxId : 0,
      );

      if (!homeEnv) {
        const formatted = formatApiProposalData(p);
        return {
          state: deriveProposalStateFromApi(formatted, p, nowSeconds),
          proposalData: null,
          eta: 0,
          votesCollected: false,
          quorum: proposalQuorum,
          isMultichain,
        };
      }

      const governorContract = isMultichain
        ? homeEnv.contracts.multichainGovernor
        : homeEnv.contracts.governor;

      let state = 0;
      let proposalData = null;
      let stateReadFailed = !governorContract;
      let proposalsReadFailed = false;

      if (governorContract) {
        const statePromise = (async () =>
          governorContract.read.state([BigInt(p.proposalId)]))();
        const proposalsPromise = (async () =>
          governorContract.read.proposals([BigInt(p.proposalId)]))();
        const [stateResult, proposalsResult] = await Promise.allSettled([
          statePromise,
          proposalsPromise,
        ]);
        if (stateResult.status === "fulfilled") {
          state = Number(stateResult.value);
        } else {
          stateReadFailed = true;
          console.warn(
            `Failed to fetch state for proposal ${p.proposalId} (chainId=${p.chainId}):`,
            stateResult.reason,
          );
          governanceEnvironment.onError?.(stateResult.reason, {
            source: "governance-proposals",
            chainId: p.chainId,
          });
        }
        if (proposalsResult.status === "fulfilled") {
          proposalData = proposalsResult.value ?? null;
        } else {
          proposalsReadFailed = true;
          console.warn(
            `Failed to fetch proposalData for proposal ${p.proposalId} (chainId=${p.chainId}):`,
            proposalsResult.reason,
          );
          governanceEnvironment.onError?.(proposalsResult.reason, {
            source: "governance-proposals",
            chainId: p.chainId,
          });
        }
      }

      // State read produced nothing — derive from API events so a terminal
      // proposal doesn't surface as Pending(0).
      if (stateReadFailed) {
        const formatted = formatApiProposalData(p);
        state = deriveProposalStateFromApi(formatted, p, nowSeconds);
      }

      let eta = 0;

      if (proposalData) {
        const onChainEta = Number(proposalData[4]);
        if (onChainEta === 0 && isMultichain && p.votingEndTime) {
          eta = p.votingEndTime + 86400; // 1 day
        } else {
          eta = onChainEta;
        }
      } else if (
        isMultichain &&
        p.votingEndTime &&
        !(proposalsReadFailed && !stateReadFailed)
      ) {
        // Skip the synthetic eta only when proposals() was attempted+rejected
        // but state succeeded — pairing real on-chain state with a fabricated
        // countdown would silently diverge if the governor's
        // `crossChainVoteCollectionPeriod` ever changes from the hardcoded
        // 1 day. When state also failed (or no read was attempted at all),
        // synthesize as a best-effort match to the API-derived state.
        eta = p.votingEndTime + 86400; // 1 day
      }

      // Cross-chain vote collection is the multichain governor's own state
      // machine: votes can only be bridged in during the post-voting
      // `crossChainVoteCollectionPeriod`, and once that window closes the state
      // advances to Succeeded/Defeated. So "collection complete" is exactly
      // `state > MultichainVoteCollection`. Reading per-satellite tallies and
      // AND-ing them would pin false forever for a satellite where no one
      // voted (its entry stays [0,0,0] even after collection ends).
      //
      // NOTE: this comparison must run against the raw governor state — once
      // we normalize through MultichainProposalStateMapping below, the values
      // are in ProposalState space and the inequality stops being meaningful.
      const votesCollected =
        isMultichain &&
        !stateReadFailed &&
        state > MultichainProposalState.MultichainVoteCollection;

      // Normalize successful multichain reads from MultichainProposalState
      // (Active=0, MultichainVoteCollection=1, Canceled=2, Defeated=3,
      // Succeeded=4, Executed=5) into the public ProposalState enum. Consumers
      // compare against ProposalState constants — leaving the value raw would
      // mislabel (e.g. MultichainVoteCollection(1) collides with
      // ProposalState.Active(1)). The API-derived fallback path already
      // returns ProposalState values, so we only map the read-succeeded case.
      const normalizedState =
        !stateReadFailed && isMultichain
          ? ((MultichainProposalStateMapping as Record<number, ProposalState>)[
              state
            ] ?? state)
          : state;

      return {
        state: normalizedState,
        proposalData,
        eta,
        votesCollected,
        quorum: proposalQuorum,
        isMultichain,
      };
    }),
  );

  return onChainDataList;
};

/**
 * Get proposal data from on-chain (Ponder-based, for Moonriver)
 */
export const getProposalData = async (params: {
  environment: Environment;
  id?: number;
}) => {
  try {
    if (params.environment.contracts.governor) {
      let count = 0n;
      let quorum = 0n;

      if (params.environment.chainId === moonriver.id) {
        [count, quorum] = await Promise.all([
          params.environment.contracts.governor.read.proposalCount(),
          params.environment.contracts.governor.read.getQuorum(),
        ]);
      } else {
        [count, quorum] = await Promise.all([
          params.environment.contracts.governor.read.proposalCount(),
          params.environment.contracts.governor.read.quorumVotes(),
        ]);
      }

      if (params.id) {
        if (BigInt(params.id) > count) {
          return [];
        }
      }

      const ids = params.id
        ? [BigInt(params.id)]
        : Array.from({ length: Number(count) }, (_, i) => count - BigInt(i));

      const proposalDataCall = Promise.all(
        ids.map((id) =>
          params.environment.contracts.governor?.read.proposals([id]),
        ),
      );

      const proposalStateCall = Promise.all(
        ids.map((id) =>
          params.environment.contracts.governor?.read.state([id]),
        ),
      );

      const [proposalsData, proposalsState] = await Promise.all([
        proposalDataCall,
        proposalStateCall,
      ]);

      const proposals = proposalsData?.map((item, index: number) => {
        const state = proposalsState?.[index]!;

        const [
          id,
          proposer,
          eta,
          startTimestamp,
          endTimestamp,
          startBlock,
          forVotes,
          againstVotes,
          abstainVotes,
          totalVotes,
          canceled,
          executed,
        ] = item!;

        const proposal: Proposal = {
          chainId: params.environment.chainId,
          id: Number(id),
          proposalId: Number(id),
          proposer,
          eta: Number(eta),
          startTimestamp: Number(startTimestamp),
          endTimestamp: Number(endTimestamp),
          startBlock: Number(startBlock),
          forVotes: new Amount(forVotes, 18),
          againstVotes: new Amount(againstVotes, 18),
          abstainVotes: new Amount(abstainVotes, 18),
          totalVotes: new Amount(totalVotes, 18),
          canceled,
          executed,
          quorum: new Amount(quorum, 18),
          state,
        };

        return proposal;
      });

      return proposals;
    } else {
      return [];
    }
  } catch (error) {
    console.warn(
      `[getProposalData] RPC failed for chain ${params.environment.chainId}:`,
      error,
    );
    params.environment.onError?.(error, {
      source: "governance-proposals",
      chainId: params.environment.chainId,
    });
    return [];
  }
};

/**
 * Get cross-chain proposal data (Ponder-based, for Moonriver)
 */
export const getCrossChainProposalData = async (params: {
  environment: Environment;
  id?: number;
}) => {
  try {
    if (params.environment.contracts.governor) {
      const xcGovernanceSettings = params.environment.custom.governance;
      if (
        params.environment.contracts.multichainGovernor &&
        xcGovernanceSettings &&
        xcGovernanceSettings.chainIds.length > 0
      ) {
        const xcEnvironments = xcGovernanceSettings.chainIds
          .map((chainId) =>
            (Object.values(publicEnvironments) as Environment[]).find(
              (env) => env.chainId === chainId,
            ),
          )
          .filter((xcEnvironment) => !!xcEnvironment)
          .filter(
            (xcEnvironment) =>
              xcEnvironment!.custom?.wormhole?.chainId &&
              xcEnvironment!.contracts.voteCollector,
          );

        const [xcCount, xcQuorum] = await Promise.all([
          params.environment.contracts.multichainGovernor.read.proposalCount(),
          params.environment.contracts.multichainGovernor.read.quorum(),
        ]);

        if (params.id) {
          params.id =
            Number(params.id) -
            (params.environment.custom?.governance?.proposalIdOffset || 0);

          if (params.id < 0) return [];
          if (BigInt(params.id) > xcCount) return [];
        }

        const ids = params.id
          ? [BigInt(params.id)]
          : Array.from(
              { length: Number(xcCount) },
              (_, i) => xcCount - BigInt(i),
            );

        const xcProposalsDataCall = Promise.all(
          ids.map((id) =>
            params.environment.contracts.multichainGovernor?.read.proposals([
              id,
            ]),
          ),
        );

        const xcProposalsStateCall = Promise.all(
          ids.map((id) =>
            params.environment.contracts.multichainGovernor?.read.state([id]),
          ),
        );

        const xcVotesCall = Promise.all(
          xcEnvironments.map((xcEnvironment) =>
            Promise.all(
              ids.map((id) =>
                params.environment.contracts.multichainGovernor?.read.chainVoteCollectorVotes(
                  [(xcEnvironment!.custom as any).wormhole.chainId, id],
                ),
              ),
            ),
          ),
        );

        const [xcProposalsData, xcProposalsState, xcVotes] = await Promise.all([
          xcProposalsDataCall,
          xcProposalsStateCall,
          xcVotesCall,
        ]);

        const proposals = ids.map((xcId, proposalIndex: number) => {
          const state = xcProposalsState?.[proposalIndex]!;
          const id =
            Number(xcId) +
            (params.environment.custom?.governance?.proposalIdOffset || 0);

          const votesCollected = false;

          const votes = xcVotes.reduce(
            (prevVotes, currVotes) => {
              const voteData = currVotes[proposalIndex];
              if (!voteData) {
                return prevVotes;
              }

              // chainVoteCollectorVotes returns [forVotes, againstVotes, abstainVotes]
              const forVotes = voteData[0] || 0n;
              const againstVotes = voteData[1] || 0n;
              const abstainVotes = voteData[2] || 0n;
              const totalVotes = forVotes + againstVotes + abstainVotes;

              return {
                totalVotes: prevVotes.totalVotes + totalVotes,
                forVotes: prevVotes.forVotes + forVotes,
                againstVotes: prevVotes.againstVotes + againstVotes,
                abstainVotes: prevVotes.abstainVotes + abstainVotes,
              };
            },
            {
              totalVotes: 0n,
              forVotes: 0n,
              againstVotes: 0n,
              abstainVotes: 0n,
            },
          );

          const proposalData = xcProposalsData?.[proposalIndex];
          if (!proposalData) {
            throw new Error(
              `Proposal data not found for index ${proposalIndex}`,
            );
          }

          const [
            proposer,
            _voteSnapshotTimestamp,
            votingStartTime,
            votingEndTime,
            crossChainVoteCollectionEndTimestamp,
            voteSnapshotBlock,
            proposalForVotes,
            proposalAgainstVotes,
            proposalAbstainVotes,
            proposalTotalVotes,
            canceled,
            executed,
          ] = proposalData;

          const multichainState = (
            MultichainProposalStateMapping as { [key: number]: ProposalState }
          )[state]!;

          const proposal: Proposal = {
            chainId: params.environment.chainId,
            id,
            proposalId: Number(xcId),
            proposer,
            eta: Number(crossChainVoteCollectionEndTimestamp),
            startTimestamp: Number(votingStartTime),
            endTimestamp: Number(votingEndTime),
            startBlock: Number(voteSnapshotBlock),
            forVotes: new Amount(proposalForVotes + votes.forVotes, 18),
            againstVotes: new Amount(
              proposalAgainstVotes + votes.againstVotes,
              18,
            ),
            abstainVotes: new Amount(
              proposalAbstainVotes + votes.abstainVotes,
              18,
            ),
            totalVotes: new Amount(proposalTotalVotes + votes.totalVotes, 18),
            canceled,
            executed,
            quorum: new Amount(xcQuorum, 18),
            state: multichainState,
            multichain: {
              id: Number(xcId),
              votesCollected,
            },
          };

          return proposal;
        });

        return proposals;
      } else {
        return [];
      }
    } else {
      return [];
    }
  } catch (error) {
    console.warn(
      `[getCrossChainProposalData] RPC failed for chain ${params.environment.chainId}:`,
      error,
    );
    params.environment.onError?.(error, {
      source: "governance-proposals",
      chainId: params.environment.chainId,
    });
    return [];
  }
};

export const appendProposalExtendedData = (
  proposals: Proposal[],
  extendedDatas: PonderExtendedProposalData[],
) => {
  proposals.forEach((proposal) => {
    const extendedData = extendedDatas.find(
      (item) => item.id === proposal.proposalId,
    );

    if (extendedData) {
      proposal.title = extendedData.title;
      proposal.calldatas = extendedData.calldatas;
      proposal.description = extendedData.description;
      proposal.signatures = extendedData.signatures;
      proposal.stateChanges = extendedData.stateChanges.map((change) => ({
        blockNumber: change.blockNumber,
        transactionHash: change.transactionHash,
        state: change.state,
        chainId: proposal.chainId,
      }));
      proposal.subtitle = extendedData.subtitle;
      proposal.targets = extendedData.targets;
    }
  });
};

export const getExtendedProposalData = async (params: {
  environment: Environment;
  id?: number;
}): Promise<PonderExtendedProposalData[]> => {
  const result: PonderExtendedProposalData[] = [];
  let lastId = -1;
  let shouldContinue = true;
  const MAX_PAGES = 100;
  let page = 0;

  try {
    while (shouldContinue && page < MAX_PAGES) {
      page++;
      const response = await postWithRetry<{
        data: {
          proposals: {
            items: {
              proposalId: number;
              description: string;
              targets: string[];
              calldatas: string[];
              signatures: string[];
              stateChanges: {
                items: {
                  txnHash: string;
                  blockNumber: number;
                  newState: string;
                }[];
              };
            }[];
          };
        };
      }>("https://ponder-eu2.moonwell.fi", {
        query: `
            query {
              proposals(
                limit: 1000,
                orderDirection: "desc",
                orderBy: "proposalId",
                where: {
                  chainId: ${params.environment.chainId}
                  ${params.id ? `, proposalId: ${params.id}` : lastId >= 0 ? `, proposalId_lt: ${lastId}` : ""}
                }
              ) {
                items {
                  id
                  proposalId
                  description
                  targets
                  calldatas
                  signatures
                  stateChanges(orderBy: "blockNumber") {
                    items {
                      txnHash
                      blockNumber
                      newState
                    }
                  }
                }
              }
            }
          `,
      });

      if (response.status === 200 && response.data?.data?.proposals) {
        const proposals = response.data.data.proposals.items.map((item) => {
          const extendedProposalData: PonderExtendedProposalData = {
            id: item.proposalId,
            title: `Proposal #${item.proposalId}`,
            subtitle: extractProposalSubtitle(item.description),
            description: item.description,
            calldatas: item.calldatas,
            signatures: item.signatures,
            stateChanges: item.stateChanges.items.map((change) => {
              return {
                blockNumber: change.blockNumber,
                state: change.newState,
                transactionHash: change.txnHash,
              };
            }),
            targets: item.targets,
          };

          return extendedProposalData;
        });

        if (proposals.length < 1000 || proposals.length === 0) {
          shouldContinue = false;
        } else {
          lastId = last(proposals)!.id;
        }

        result.push(...proposals);
      } else {
        shouldContinue = false;
      }
    }
  } catch (error) {
    console.warn(
      `[getExtendedProposalData] Ponder failed for chain ${params.environment.chainId}:`,
      error,
    );
    params.environment.onError?.(error, {
      source: "governance-proposals",
      chainId: params.environment.chainId,
    });
    return result;
  }

  return result;
};
