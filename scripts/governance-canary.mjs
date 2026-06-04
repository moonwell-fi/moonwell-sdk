#!/usr/bin/env node
// Governance canary — proves that every LIVE proposal can actually be voted on.
//
// Born from the proposal-171 incident (MOO-351): the first hub-local proposal
// opened with voting silently broken on every chain for ~21 hours before a
// user report surfaced it. Prevention failed twice (PR review, launch test);
// this is the detection layer that does not depend on anyone imagining the
// failure mode. Runs on a schedule while any proposal is in its voting window.
//
// For each Active proposal it asserts:
//   1. CLASSIFICATION — `proposal.multichain` is consistent with the home
//      governor (a proposal homed on a hub env that has a multichainGovernor
//      and no legacy governor MUST be multichain).
//   2. CASTABILITY — on every chain that renders vote buttons, an eth_call
//      simulation of `castVote(id, 0)` from a real delegate either succeeds
//      or reverts INSIDE the governor (recognizable revert data). "Returned
//      no data (0x)", missing contract, or transport errors fail the canary —
//      that's the wrong-contract / dead-route signature.
//   3. VOTING POWER — `getUserVotingPowers` at the proposal snapshot resolves
//      every governance chain (a missing chain means a chain's read failed —
//      the bug-B blast-radius signature).
//
// Env:
//   CANARY_DELEGATE  — address with delegated WELL used for simulations
//                      (default: a known long-standing delegate; override in CI)
//   RPC_BASE_URL     — RPC prefix (default https://rpc.moonwell.fi/main/evm)
//
// Exit code 0 = healthy or nothing live; 1 = canary tripped (workflow alerts).

// No direct viem import: pnpm hoists viem under the `src` package, not the
// repo root. The SDK environments carry everything needed — a viem
// PublicClient per chain and contract address/abi pairs.
import { createMoonwellClient } from "../src/_esm/index.js";

const RPC = process.env.RPC_BASE_URL ?? "https://rpc.moonwell.fi/main/evm";
const DELEGATE =
  process.env.CANARY_DELEGATE ?? "0x10b83c88e88910cd5293324800d1a6e751004be5";

const WELL_CHAIN_IDS = [1, 8453, 10, 1284];
const PROPOSAL_STATE_ACTIVE = 1;

const client = createMoonwellClient({
  networks: {
    ethereum: { rpcUrls: [`${RPC}/1`] },
    base: { rpcUrls: [`${RPC}/8453`] },
    optimism: { rpcUrls: [`${RPC}/10`] },
    moonbeam: { rpcUrls: [`${RPC}/1284`] },
    moonriver: { rpcUrls: [`${RPC}/1285`] },
  },
});

const failures = [];
const fail = (msg) => {
  failures.push(msg);
  console.error(`CANARY FAIL: ${msg}`);
};
const ok = (msg) => console.log(`canary ok: ${msg}`);

const envByChainId = (chainId) =>
  Object.values(client.environments).find((e) => e.chainId === chainId);

const isHubHome = (env) =>
  Boolean(env?.contracts?.multichainGovernor && !env?.contracts?.governor);

// A simulation that reverts INSIDE the governor still proves the route is
// alive (e.g. "already voted"). What must never happen is the dead-route
// signature: empty revert data, nonexistent function, or missing contract.
const isDeadRouteError = (error) => {
  const text = String(error?.shortMessage ?? error?.message ?? error);
  return (
    text.includes("returned no data") ||
    text.includes('function "castVote" not found') ||
    text.includes("is not a contract") ||
    text.includes("HTTP request failed")
  );
};

async function checkProposal(proposal) {
  const id = `${proposal.chainId}-${proposal.proposalId}`;
  const homeEnv = envByChainId(proposal.chainId);

  // 1. Classification consistency.
  if (isHubHome(homeEnv) && !proposal.multichain) {
    fail(
      `${id}: homed on hub chain ${proposal.chainId} but multichain is unset — vote routing will dead-end (the proposal-171 bug).`,
    );
  } else {
    ok(
      `${id}: classification consistent (multichain=${Boolean(proposal.multichain)})`,
    );
  }

  // 2. Castability on every voting chain.
  const voteId = BigInt(proposal.multichain?.id ?? proposal.proposalId);
  for (const chainId of WELL_CHAIN_IDS) {
    const env = envByChainId(chainId);
    const target =
      env?.contracts?.voteCollector ?? env?.contracts?.multichainGovernor;
    if (!target) {
      fail(`${id}: chain ${chainId} has no voteCollector/multichainGovernor`);
      continue;
    }
    try {
      await env.publicClient.simulateContract({
        address: target.address,
        abi: target.abi,
        functionName: "castVote",
        args: [voteId, 0],
        account: DELEGATE,
      });
      ok(`${id}: castVote simulates on chain ${chainId}`);
    } catch (error) {
      if (isDeadRouteError(error)) {
        fail(
          `${id}: castVote dead-route on chain ${chainId} via ${target.address}: ${String(error?.shortMessage ?? error?.message).split("\n")[0]}`,
        );
      } else {
        // In-governor revert (already voted / no power on that chain) —
        // the route is alive, which is what the canary guards.
        ok(
          `${id}: castVote reaches governor logic on chain ${chainId} (revert: ${String(error?.shortMessage ?? error?.message).split("\n")[0]})`,
        );
      }
    }
  }

  // 3. Snapshot voting power resolves on every governance chain.
  try {
    const powers = await client.getUserVotingPowers({
      userAddress: DELEGATE,
      governanceToken: "WELL",
      snapshotTimestamp: proposal.startTimestamp,
    });
    const got = new Set(powers.map((p) => p.chainId));
    const missing = WELL_CHAIN_IDS.filter((c) => !got.has(c));
    if (missing.length > 0) {
      fail(
        `${id}: snapshot voting power missing for chain(s) ${missing.join(", ")} — per-chain read failed (bug-B signature).`,
      );
    } else {
      ok(`${id}: snapshot voting power resolves on all ${got.size} chains`);
    }
  } catch (error) {
    fail(
      `${id}: getUserVotingPowers rejected outright: ${String(error?.shortMessage ?? error?.message).split("\n")[0]}`,
    );
  }
}

const proposals = await client.getProposals();
const live = proposals.filter((p) => p.state === PROPOSAL_STATE_ACTIVE);

if (live.length === 0) {
  console.log("canary: no proposals in voting window — nothing to check.");
  process.exit(0);
}

console.log(
  `canary: ${live.length} live proposal(s): ${live.map((p) => p.proposalId).join(", ")}`,
);
for (const proposal of live) {
  await checkProposal(proposal);
}

if (failures.length > 0) {
  console.error(`\ncanary TRIPPED — ${failures.length} failure(s).`);
  process.exit(1);
}
console.log("\ncanary healthy.");
