import { type Address, zeroAddress } from "viem";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import {
  Amount,
  getBlockNumberAtTimestamp,
  getEnvironmentsFromArgs,
} from "../../common/index.js";
import type { OptionalNetworkParameterType } from "../../common/types.js";
import type { Chain, GovernanceToken } from "../../environments/index.js";
import type { UserVotingPowers } from "../../types/userVotingPowers.js";

const warnedNoViewsEnvs = new Set<string>();

export type GetUserVotingPowersParameters<
  environments,
  network extends Chain | undefined,
> = OptionalNetworkParameterType<environments, network> & {
  /** Governance token */
  governanceToken: GovernanceToken;

  /** User address*/
  userAddress: Address;

  /**
   * Block number to read voting power at. Applied to every queried chain — only safe
   * for single-chain governance tokens. For cross-chain tokens (e.g. WELL) prefer
   * `snapshotTimestamp`, which resolves a correct per-chain block.
   */
  blockNumber?: bigint;

  /**
   * Unix timestamp (seconds) at which to read voting power. When set, the SDK looks up
   * the block on each queried chain whose timestamp is the latest one ≤ this value, and
   * uses that per-chain block. Use this for cross-chain governance tokens; supplying a
   * single block number across heterogeneous chains is unsafe because chain heights
   * diverge. Takes priority over `blockNumber` when both are provided.
   */
  snapshotTimestamp?: number;
};

export type GetUserVotingPowersReturnType = Promise<UserVotingPowers[]>;

export async function getUserVotingPowers<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetUserVotingPowersParameters<environments, Network>,
): GetUserVotingPowersReturnType {
  const { governanceToken, userAddress, blockNumber, snapshotTimestamp } = args;

  const environments = getEnvironmentsFromArgs(client, args);

  // A chain can hold a governance token without deploying a views contract
  // (voting reads run on the hub). Skipping the no-views case here lets the
  // read site below call views.read.getUserVotingPower directly.
  const tokenEnvironments = environments.flatMap((env) => {
    if (env.custom?.governance?.token !== governanceToken) {
      return [];
    }
    const views = env.contracts.views;
    if (views === undefined) {
      const key = `${env.chainId}:${governanceToken}`;
      if (!warnedNoViewsEnvs.has(key)) {
        warnedNoViewsEnvs.add(key);
        console.warn(
          `[moonwell-sdk] getUserVotingPowers: skipping chainId=${env.chainId} for governanceToken=${governanceToken} — environment holds the token but has no views contract.`,
        );
      }
      return [];
    }
    return [{ env, views }];
  });

  // Resolve per-chain block numbers independently — a single chain RPC failure
  // should not abort the whole call. Fulfilled entries keep their index so the
  // index still aligns with tokenEnvironments below.
  const perChainBlockNumbers =
    snapshotTimestamp !== undefined
      ? await Promise.allSettled(
          tokenEnvironments.map(({ env }) =>
            getBlockNumberAtTimestamp(
              env.publicClient,
              BigInt(snapshotTimestamp),
            ),
          ),
        )
      : undefined;

  // Resolve voting powers per chain using allSettled so that a reverted views
  // contract on one chain (e.g. Moonbeam's getUserVotingPower revert) does not
  // cascade and kill the whole call for all chains.
  const settledVotingPowers = await Promise.allSettled(
    tokenEnvironments.map(async ({ env, views }, index) => {
      let blockForChain: bigint | undefined;
      if (perChainBlockNumbers !== undefined) {
        const blockResult = perChainBlockNumbers[index];
        if (blockResult === undefined || blockResult.status === "rejected") {
          // Throw so this chain lands in "rejected" in settledVotingPowers.
          // onError is fired once in the flatMap loop below — not here — to
          // avoid double-calling when both the block-lookup and the allSettled
          // handler would otherwise report the same failure.
          throw blockResult?.reason ?? new Error("block-number lookup failed");
        }
        blockForChain = blockResult.value;
      } else {
        blockForChain = blockNumber;
      }
      const votingPowers = await views.read.getUserVotingPower([userAddress], {
        blockNumber: blockForChain,
      });
      return { env, votingPowers };
    }),
  );

  const resolvedVotingPowers = settledVotingPowers.flatMap((result, index) => {
    if (result.status === "fulfilled") {
      return [result.value];
    }
    const entry = tokenEnvironments[index];
    if (entry !== undefined) {
      // Determine whether the failure came from block-number resolution or from
      // the views contract read, so the onError source is actionable.
      const blockFailed =
        perChainBlockNumbers !== undefined &&
        perChainBlockNumbers[index]?.status === "rejected";
      entry.env.onError?.(result.reason, {
        source: blockFailed
          ? "getUserVotingPower-block-lookup"
          : "getUserVotingPower",
        chainId: entry.env.chainId,
      });
    }
    return [];
  });

  return resolvedVotingPowers.map(({ env: environment, votingPowers }) => {
    return {
      chainId: environment.chainId,

      //Claims balances
      claimsDelegates: votingPowers.claimsVotes.delegates,
      claimsBalance: new Amount(votingPowers.claimsVotes.votingPower, 18),
      claimsDelegated: new Amount(
        votingPowers.claimsVotes.delegatedVotingPower,
        18,
      ),
      claimsDelegatedOthers: new Amount(
        votingPowers.claimsVotes.delegatedVotingPower -
          (votingPowers.claimsVotes.delegates === userAddress
            ? votingPowers.claimsVotes.votingPower
            : 0n),
        18,
      ),
      claimsDelegatedSelf: new Amount(
        votingPowers.claimsVotes.delegates === userAddress
          ? votingPowers.claimsVotes.votingPower
          : 0n,
        18,
      ),

      claimsUndelegated: new Amount(
        votingPowers.claimsVotes.delegates === zeroAddress
          ? votingPowers.claimsVotes.votingPower
          : 0n,
        18,
      ),

      //Token balances
      tokenDelegates: votingPowers.tokenVotes.delegates,
      tokenBalance: new Amount(votingPowers.tokenVotes.votingPower, 18),
      tokenDelegated: new Amount(
        votingPowers.tokenVotes.delegatedVotingPower,
        18,
      ),
      tokenDelegatedOthers: new Amount(
        votingPowers.tokenVotes.delegatedVotingPower -
          (votingPowers.tokenVotes.delegates === userAddress
            ? votingPowers.tokenVotes.votingPower
            : 0n),
        18,
      ),
      tokenDelegatedSelf: new Amount(
        votingPowers.tokenVotes.delegates === userAddress
          ? votingPowers.tokenVotes.votingPower
          : 0n,
        18,
      ),
      tokenUndelegated: new Amount(
        votingPowers.tokenVotes.delegates === zeroAddress
          ? votingPowers.tokenVotes.votingPower
          : 0n,
        18,
      ),

      stakingDelegated: new Amount(
        votingPowers.stakingVotes.delegatedVotingPower,
        18,
      ),

      totalDelegated: new Amount(
        votingPowers.claimsVotes.delegatedVotingPower +
          votingPowers.tokenVotes.delegatedVotingPower +
          votingPowers.stakingVotes.delegatedVotingPower,
        18,
      ),

      totalDelegatedOthers: new Amount(
        votingPowers.claimsVotes.delegatedVotingPower -
          (votingPowers.claimsVotes.delegates === userAddress
            ? votingPowers.claimsVotes.votingPower
            : 0n) +
          (votingPowers.tokenVotes.delegatedVotingPower -
            (votingPowers.tokenVotes.delegates === userAddress
              ? votingPowers.tokenVotes.votingPower
              : 0n)),
        18,
      ),

      totalDelegatedSelf: new Amount(
        (votingPowers.claimsVotes.delegates === userAddress
          ? votingPowers.claimsVotes.votingPower
          : 0n) +
          (votingPowers.tokenVotes.delegates === userAddress
            ? votingPowers.tokenVotes.votingPower
            : 0n) +
          votingPowers.stakingVotes.delegatedVotingPower,
        18,
      ),
    };
  });
}
