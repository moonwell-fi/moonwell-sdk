import { beforeEach, describe, expect, test, vi } from "vitest";
import { Amount } from "../../../common/index.js";
import { publicEnvironments } from "../../../environments/index.js";
import { ProposalState } from "../../../types/proposal.js";
import type {
  ApiProposal,
  ApiProposalStateChange,
} from "../governor-api-client.js";
import {
  type ApiProposalFormatted,
  WORMHOLE_CONTRACT,
  deriveProposalStateFromApi,
  getProposalsOnChainData,
  isMultichainAware,
  isMultichainProposal,
} from "./common.js";

// Minimal stand-in for `publicEnvironments` exposing only the fields the
// foreign-env governor lookup and the voteCollector filter inspect. The
// Ethereum entry carries mocked `multichainGovernor` reads so foreign-env
// tests can configure per-test return values via `vi.mocked(...)`. Values are
// inlined inside the factory because vi.mock factories are hoisted above any
// top-level constants. `governance.chainIds` is `[1284, 8453]` in the mock —
// a subset of production's `[moonbeam, base, optimism]` — to keep tests
// focused on a pair of satellites without needing an Optimism stub.
vi.mock("../../../environments/index.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../environments/index.js")>();
  return {
    ...actual,
    publicEnvironments: {
      ethereum: {
        chainId: 1,
        custom: {
          wormhole: { chainId: 2 },
          governance: { token: "WELL", chainIds: [1284, 8453] },
        },
        contracts: {
          multichainGovernor: {
            read: {
              state: vi.fn(),
              proposals: vi.fn(),
              chainVoteCollectorVotes: vi.fn(),
              quorum: vi.fn(),
            },
          },
        },
      },
      moonbeam: {
        chainId: 1284,
        custom: { wormhole: { chainId: 16 } },
        contracts: {
          voteCollector: "0xB8A798a50a7274A13449B7f2Dd6Df22faF2d40E5",
        },
      },
      base: {
        chainId: 8453,
        custom: { wormhole: { chainId: 30 } },
        contracts: {
          voteCollector: "0x0000000000000000000000000000000000000001",
        },
      },
    },
  };
});

const MOONBEAM_WORMHOLE_CHAIN_ID = 16;
const BASE_WORMHOLE_CHAIN_ID = 30;

const LOCAL_TARGET = "0xed301cd3eb27217bdb05c4e9b820a8a3c8b665f9";
const ETHEREUM_WORMHOLE_BRIDGE = "0x98f3c9e6e3face36baad05fe09d375ef1464288b";

describe("isMultichainProposal", () => {
  test("matches when targets include the Moonbeam Wormhole bridge", () => {
    expect(isMultichainProposal([WORMHOLE_CONTRACT])).toBe(true);
  });

  test("matches when targets include the Ethereum Wormhole bridge", () => {
    expect(isMultichainProposal([ETHEREUM_WORMHOLE_BRIDGE])).toBe(true);
  });

  test("matches when Wormhole address is uppercase", () => {
    expect(isMultichainProposal([WORMHOLE_CONTRACT.toUpperCase()])).toBe(true);
    expect(isMultichainProposal([ETHEREUM_WORMHOLE_BRIDGE.toUpperCase()])).toBe(
      true,
    );
  });

  test("matches when Wormhole bridge is buried in a long targets list", () => {
    expect(
      isMultichainProposal([
        LOCAL_TARGET,
        LOCAL_TARGET,
        ETHEREUM_WORMHOLE_BRIDGE,
        LOCAL_TARGET,
      ]),
    ).toBe(true);
  });

  test("returns false when targets don't include any known Wormhole bridge", () => {
    expect(isMultichainProposal([LOCAL_TARGET])).toBe(false);
  });

  test("returns false for undefined or empty targets", () => {
    expect(isMultichainProposal(undefined)).toBe(false);
    expect(isMultichainProposal([])).toBe(false);
  });
});

describe("isMultichainAware", () => {
  test("returns true when targets include Wormhole even if proposalId is below cutoff", () => {
    expect(
      isMultichainAware({ targets: [WORMHOLE_CONTRACT], proposalId: 10 }, 100),
    ).toBe(true);
  });

  test("returns true when proposalId is past the legacy Artemis cutoff", () => {
    expect(
      isMultichainAware({ targets: [LOCAL_TARGET], proposalId: 93 }, 86),
    ).toBe(true);
  });

  test("returns false when proposalId is at or below the cutoff and no Wormhole target", () => {
    expect(
      isMultichainAware({ targets: [LOCAL_TARGET], proposalId: 86 }, 86),
    ).toBe(false);
    expect(
      isMultichainAware({ targets: [LOCAL_TARGET], proposalId: 50 }, 86),
    ).toBe(false);
  });

  test("falls back to targets-only when legacyArtemisMaxId is 0 (proposalCount RPC failed)", () => {
    expect(
      isMultichainAware({ targets: [WORMHOLE_CONTRACT], proposalId: 999 }, 0),
    ).toBe(true);
    expect(
      isMultichainAware({ targets: [LOCAL_TARGET], proposalId: 999 }, 0),
    ).toBe(false);
  });

  test("returns false for an unknown proposal (no targets, no past-cutoff id)", () => {
    expect(isMultichainAware({ proposalId: 1 }, 86)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deriveProposalStateFromApi
// ---------------------------------------------------------------------------

const ZERO_AMOUNT = new Amount(0n, 18);
const emptyFormatted: ApiProposalFormatted = {
  forVotes: ZERO_AMOUNT,
  againstVotes: ZERO_AMOUNT,
  abstainVotes: ZERO_AMOUNT,
  totalVotes: ZERO_AMOUNT,
  canceled: false,
  executed: false,
  stateChanges: [],
  title: "",
  subtitle: "",
};

const baseApiProposal: ApiProposal = {
  id: "1-0000000007",
  chainId: 1,
  proposalId: 7,
  proposer: "0x0000000000000000000000000000000000000001",
  targets: [],
  values: [],
  calldatas: [],
  votingStartTime: 1_000,
  votingEndTime: 2_000,
  description: "",
  forVotes: "0",
  againstVotes: "0",
  abstainVotes: "0",
  blockNumber: "1",
  timestamp: 1_000,
  transactionHash: "0xabc",
};

const queuedChange: ApiProposalStateChange = {
  id: "sc-1",
  proposalId: "1-0000000007",
  state: "QUEUED",
  blockNumber: "10",
  timestamp: 1_500,
  transactionHash: "0xqueued",
  forVotes: "0",
  againstVotes: "0",
  abstainVotes: "0",
  chainId: 1,
};

describe("deriveProposalStateFromApi", () => {
  test("Executed wins over every other signal", () => {
    expect(
      deriveProposalStateFromApi(
        { ...emptyFormatted, executed: true, canceled: true },
        { ...baseApiProposal, stateChanges: [queuedChange] },
        3_000,
      ),
    ).toBe(ProposalState.Executed);
  });

  test("Canceled when not executed", () => {
    expect(
      deriveProposalStateFromApi(
        { ...emptyFormatted, canceled: true },
        baseApiProposal,
        3_000,
      ),
    ).toBe(ProposalState.Canceled);
  });

  test("Queued when stateChanges contain QUEUED and nothing terminal", () => {
    expect(
      deriveProposalStateFromApi(
        emptyFormatted,
        { ...baseApiProposal, stateChanges: [queuedChange] },
        3_000,
      ),
    ).toBe(ProposalState.Queued);
  });

  test("Active inside the voting window", () => {
    expect(
      deriveProposalStateFromApi(emptyFormatted, baseApiProposal, 1_500),
    ).toBe(ProposalState.Active);
  });

  test("Active at the inclusive boundaries of the voting window", () => {
    expect(
      deriveProposalStateFromApi(emptyFormatted, baseApiProposal, 1_000),
    ).toBe(ProposalState.Active);
    expect(
      deriveProposalStateFromApi(emptyFormatted, baseApiProposal, 2_000),
    ).toBe(ProposalState.Active);
  });

  test("Pending before voting starts", () => {
    expect(
      deriveProposalStateFromApi(emptyFormatted, baseApiProposal, 500),
    ).toBe(ProposalState.Pending);
  });

  test("Pending after voting ends with no terminal events (indexer hasn't surfaced outcome yet)", () => {
    expect(
      deriveProposalStateFromApi(emptyFormatted, baseApiProposal, 3_000),
    ).toBe(ProposalState.Pending);
  });
});

// ---------------------------------------------------------------------------
// getProposalsOnChainData — cross-chain skip path
// ---------------------------------------------------------------------------

// Chain ID not present in the mocked `publicEnvironments` above, so
// `resolveHomeEnv` returns undefined and the `!homeEnv` branch fires.
const POLYGON_CHAIN_ID = 137;

describe("getProposalsOnChainData unmapped chain", () => {
  const env = {
    chainId: 1284,
    contracts: {},
    custom: {},
  } as unknown as Parameters<typeof getProposalsOnChainData>[1];

  test("returns API-derived Executed state and zero quorum/eta when chainId has no env wired", async () => {
    const proposal: ApiProposal = {
      ...baseApiProposal,
      chainId: POLYGON_CHAIN_ID,
      proposalId: 5,
      stateChanges: [
        { ...queuedChange, state: "EXECUTED", chainId: POLYGON_CHAIN_ID },
      ],
    };

    const [onChainData] = await getProposalsOnChainData([proposal], env);

    expect(onChainData?.proposalData).toBeNull();
    expect(onChainData?.eta).toBe(0);
    expect(onChainData?.votesCollected).toBe(false);
    expect(onChainData?.quorum).toBe(0n);
    expect(onChainData?.state).toBe(ProposalState.Executed);
  });

  test("derives Active state when proposal is mid-voting-window", async () => {
    const now = Math.floor(Date.now() / 1000);
    const proposal: ApiProposal = {
      ...baseApiProposal,
      chainId: POLYGON_CHAIN_ID,
      votingStartTime: now - 100,
      votingEndTime: now + 100,
      stateChanges: [],
    };

    const [onChainData] = await getProposalsOnChainData([proposal], env);
    expect(onChainData?.state).toBe(ProposalState.Active);
  });

  test("uses options.crossChainQuorums when supplied; falls back to 0n otherwise", async () => {
    const proposal: ApiProposal = {
      ...baseApiProposal,
      chainId: POLYGON_CHAIN_ID,
      proposalId: 42,
      stateChanges: [],
    };

    const [withMap] = await getProposalsOnChainData([proposal], env, {
      crossChainQuorums: new Map([[POLYGON_CHAIN_ID, 9_876n]]),
    });
    expect(withMap?.quorum).toBe(9_876n);

    const [withoutMap] = await getProposalsOnChainData([proposal], env);
    expect(withoutMap?.quorum).toBe(0n);

    const [missingEntry] = await getProposalsOnChainData([proposal], env, {
      crossChainQuorums: new Map([[42, 1n]]),
    });
    expect(missingEntry?.quorum).toBe(0n);
  });
});

// ---------------------------------------------------------------------------
// getProposalsOnChainData — Moonbeam voteCollector wire-up
//
// Pins the contracts.ts:17 addition: adding `voteCollector` to the Moonbeam
// env is what lets it pass the filter at common.ts:434-445 and be queried as
// an xc vote collector. Without this test, a future removal/typo would
// silently turn off Moonbeam vote collection for Ethereum-home proposals.
// ---------------------------------------------------------------------------

describe("getProposalsOnChainData voteCollector wire-up", () => {
  test("Moonbeam vote collector is exercised for a same-chain multichain proposal", async () => {
    const chainVoteCollectorVotes = vi.fn(
      async () => [0n, 0n, 0n] as readonly [bigint, bigint, bigint],
    );

    // Ethereum-shaped governance env whose `chainIds` includes both Moonbeam
    // and Base. The mocked publicEnvironments above now wires voteCollector on
    // Moonbeam, so both entries must pass the filter.
    const env = {
      chainId: 1,
      contracts: {
        multichainGovernor: {
          read: { chainVoteCollectorVotes },
        },
      },
      custom: { governance: { chainIds: [1284, 8453] } },
    } as unknown as Parameters<typeof getProposalsOnChainData>[1];

    const proposal: ApiProposal = {
      ...baseApiProposal,
      chainId: 1,
      proposalId: 7,
      targets: [WORMHOLE_CONTRACT],
    };

    await getProposalsOnChainData([proposal], env);

    // The Moonbeam wormhole chainId reaches the multichain governor — this is
    // the behavior change the contracts.ts addition unlocks.
    expect(chainVoteCollectorVotes).toHaveBeenCalledWith([
      MOONBEAM_WORMHOLE_CHAIN_ID,
      7n,
    ]);
    // Counterpart: Base was already wired, so it should still be queried.
    expect(chainVoteCollectorVotes).toHaveBeenCalledWith([
      BASE_WORMHOLE_CHAIN_ID,
      7n,
    ]);
  });
});

const ETHEREUM_WORMHOLE_BRIDGE_LOWER =
  "0x98f3c9e6e3face36baad05fe09d375ef1464288b";

// Only index [4] (eta) is read; the full tuple shape is for completeness.
const buildProposalsTuple = (eta: bigint) =>
  [
    "0x0000000000000000000000000000000000000001",
    0n,
    0n,
    0n,
    eta,
    0n,
    0n,
    0n,
    0n,
    0n,
    false,
    false,
  ] as const;

describe("getProposalsOnChainData Ethereum-hub via foreign env", () => {
  const ethereumMG = (
    publicEnvironments as unknown as {
      ethereum: {
        contracts: {
          multichainGovernor: {
            read: {
              state: ReturnType<typeof vi.fn>;
              proposals: ReturnType<typeof vi.fn>;
              chainVoteCollectorVotes: ReturnType<typeof vi.fn>;
              quorum: ReturnType<typeof vi.fn>;
            };
          };
        };
      };
    }
  ).ethereum.contracts.multichainGovernor;

  const moonbeamEnv = {
    chainId: 1284,
    contracts: {},
    custom: {},
  } as unknown as Parameters<typeof getProposalsOnChainData>[1];

  beforeEach(() => {
    ethereumMG.read.state.mockReset();
    ethereumMG.read.proposals.mockReset();
    ethereumMG.read.chainVoteCollectorVotes.mockReset();
    ethereumMG.read.quorum.mockReset();
  });

  test("reads state and eta from the Ethereum multichain governor", async () => {
    ethereumMG.read.state.mockResolvedValue(ProposalState.Queued);
    ethereumMG.read.proposals.mockResolvedValue(
      buildProposalsTuple(1_700_000_000n),
    );

    const ethProposal: ApiProposal = {
      ...baseApiProposal,
      chainId: 1,
      proposalId: 169,
      targets: [ETHEREUM_WORMHOLE_BRIDGE_LOWER],
      votingEndTime: 1_699_900_000,
    };

    const [data] = await getProposalsOnChainData([ethProposal], moonbeamEnv);

    expect(ethereumMG.read.state).toHaveBeenCalledWith([169n]);
    expect(ethereumMG.read.proposals).toHaveBeenCalledWith([169n]);
    expect(data?.state).toBe(ProposalState.Queued);
    expect(data?.eta).toBe(1_700_000_000);
  });

  test("falls back to votingEndTime + 1d when on-chain eta is 0 (multichain)", async () => {
    ethereumMG.read.state.mockResolvedValue(ProposalState.Active);
    ethereumMG.read.proposals.mockResolvedValue(buildProposalsTuple(0n));

    const ethProposal: ApiProposal = {
      ...baseApiProposal,
      chainId: 1,
      proposalId: 200,
      targets: [ETHEREUM_WORMHOLE_BRIDGE_LOWER],
      votingEndTime: 1_500_000_000,
    };

    const [data] = await getProposalsOnChainData([ethProposal], moonbeamEnv);

    expect(data?.eta).toBe(1_500_000_000 + 86_400);
  });

  test("queries Ethereum-side vote collectors using Ethereum's chainIds list", async () => {
    ethereumMG.read.state.mockResolvedValue(ProposalState.Active);
    ethereumMG.read.proposals.mockResolvedValue(buildProposalsTuple(0n));
    ethereumMG.read.chainVoteCollectorVotes.mockResolvedValue([
      100n,
      0n,
      0n,
    ] as readonly [bigint, bigint, bigint]);

    const ethProposal: ApiProposal = {
      ...baseApiProposal,
      chainId: 1,
      proposalId: 169,
      targets: [ETHEREUM_WORMHOLE_BRIDGE_LOWER],
      votingEndTime: 1_500_000_000,
    };

    const [data] = await getProposalsOnChainData([ethProposal], moonbeamEnv);

    expect(ethereumMG.read.chainVoteCollectorVotes).toHaveBeenCalledWith([
      MOONBEAM_WORMHOLE_CHAIN_ID,
      169n,
    ]);
    expect(ethereumMG.read.chainVoteCollectorVotes).toHaveBeenCalledWith([
      BASE_WORMHOLE_CHAIN_ID,
      169n,
    ]);
    expect(data?.votesCollected).toBe(true);
  });

  test("votesCollected stays false if any satellite reports zero votes", async () => {
    ethereumMG.read.state.mockResolvedValue(ProposalState.Active);
    ethereumMG.read.proposals.mockResolvedValue(buildProposalsTuple(0n));
    ethereumMG.read.chainVoteCollectorVotes.mockImplementation(
      async ([wormholeChainId]: readonly [number, bigint]) =>
        wormholeChainId === MOONBEAM_WORMHOLE_CHAIN_ID
          ? ([10n, 0n, 0n] as readonly [bigint, bigint, bigint])
          : ([0n, 0n, 0n] as readonly [bigint, bigint, bigint]),
    );

    const ethProposal: ApiProposal = {
      ...baseApiProposal,
      chainId: 1,
      proposalId: 169,
      targets: [ETHEREUM_WORMHOLE_BRIDGE_LOWER],
      votingEndTime: 1_500_000_000,
    };

    const [data] = await getProposalsOnChainData([ethProposal], moonbeamEnv);

    expect(data?.votesCollected).toBe(false);
  });

  test("falls back to API-derived state and multichain eta when both reads reject", async () => {
    ethereumMG.read.state.mockRejectedValue(new Error("RPC down"));
    ethereumMG.read.proposals.mockRejectedValue(new Error("RPC down"));

    const ethProposal: ApiProposal = {
      ...baseApiProposal,
      chainId: 1,
      proposalId: 169,
      targets: [ETHEREUM_WORMHOLE_BRIDGE_LOWER],
      votingEndTime: 1_500_000_000,
      stateChanges: [{ ...queuedChange, state: "EXECUTED", chainId: 1 }],
    };

    const [data] = await getProposalsOnChainData([ethProposal], moonbeamEnv);

    expect(data?.state).toBe(ProposalState.Executed);
    expect(data?.proposalData).toBeNull();
    expect(data?.eta).toBe(1_500_000_000 + 86_400);
  });

  test("uses options.crossChainQuorums entry for the proposal chainId without reading homeEnv.quorum", async () => {
    ethereumMG.read.state.mockResolvedValue(ProposalState.Active);
    ethereumMG.read.proposals.mockResolvedValue(buildProposalsTuple(0n));

    const ethProposal: ApiProposal = {
      ...baseApiProposal,
      chainId: 1,
      proposalId: 169,
      targets: [ETHEREUM_WORMHOLE_BRIDGE_LOWER],
      votingEndTime: 1_500_000_000,
    };

    const [withMap] = await getProposalsOnChainData(
      [ethProposal],
      moonbeamEnv,
      {
        crossChainQuorums: new Map([[1, 12_345n]]),
      },
    );
    expect(withMap?.quorum).toBe(12_345n);
    expect(ethereumMG.read.quorum).not.toHaveBeenCalled();

    const [withoutMap] = await getProposalsOnChainData(
      [ethProposal],
      moonbeamEnv,
    );
    expect(withoutMap?.quorum).toBe(0n);
    expect(ethereumMG.read.quorum).not.toHaveBeenCalled();
  });
});

describe("getProposalsOnChainData local read failure", () => {
  test("derives state from API events when the caller's governor reads reject", async () => {
    const localMG = {
      read: {
        state: vi.fn().mockRejectedValue(new Error("RPC down")),
        proposals: vi.fn().mockRejectedValue(new Error("RPC down")),
      },
    };
    const localMoonbeamEnv = {
      chainId: 1284,
      contracts: { multichainGovernor: localMG },
      custom: {},
    } as unknown as Parameters<typeof getProposalsOnChainData>[1];

    const proposal: ApiProposal = {
      ...baseApiProposal,
      chainId: 1284,
      proposalId: 200,
      targets: [WORMHOLE_CONTRACT],
      votingEndTime: 1_500_000_000,
      stateChanges: [{ ...queuedChange, state: "EXECUTED", chainId: 1284 }],
    };

    const [data] = await getProposalsOnChainData([proposal], localMoonbeamEnv);

    expect(data?.state).toBe(ProposalState.Executed);
    expect(data?.proposalData).toBeNull();
  });
});
