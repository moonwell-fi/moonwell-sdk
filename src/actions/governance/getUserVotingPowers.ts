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

const warnedSkippedEnvs = new Set<string>();

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
      const key = `${env.chainId}:${governanceToken}:no-views`;
      if (!warnedSkippedEnvs.has(key)) {
        warnedSkippedEnvs.add(key);
        console.warn(
          `[moonwell-sdk] getUserVotingPowers: skipping chainId=${env.chainId} for governanceToken=${governanceToken} — environment holds the token but has no views contract.`,
        );
      }
      return [];
    }
    return [{ env, views }];
  });

  // Per-chain isolation: one chain's failing block resolution or views read
  // must degrade ONLY that chain, never the whole call. The previous
  // implementation wrapped everything in a single Promise.all, so a Moonbeam
  // revert erased voting power on every chain at once — which hid the vote
  // buttons for all users during the proposal-171 incident (June 2026).
  // Failed chains are reported through `env.onError` and omitted from the
  // result; consumers see partial data instead of a rejection.
  const settled = await Promise.allSettled(
    tokenEnvironments.map(async ({ env, views }) => {
      const blockForChain =
        snapshotTimestamp !== undefined
          ? await getBlockNumberAtTimestamp(
              env.publicClient,
              BigInt(snapshotTimestamp),
            )
          : blockNumber;
      const votingPowers = await views.read.getUserVotingPower([userAddress], {
        blockNumber: blockForChain,
      });
      return { env, votingPowers };
    }),
  );

  const resolvedVotingPowers = settled.flatMap((result, index) => {
    if (result.status === "fulfilled") {
      return [result.value];
    }
    const env = tokenEnvironments[index]?.env;
    console.warn(
      `[moonwell-sdk] getUserVotingPowers: skipping chainId=${env?.chainId} — voting-power read failed; returning remaining chains.`,
      result.reason,
    );
    env?.onError?.(result.reason, {
      source: "getUserVotingPowers",
      chainId: env.chainId,
    });
    return [];
  });

  return resolvedVotingPowers.map(({ env: environment, votingPowers }) => {
    const { tokenVotes } = votingPowers;

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
      tokenDelegates: tokenVotes.delegates,
      tokenBalance: new Amount(tokenVotes.votingPower, 18),
      tokenDelegated: new Amount(tokenVotes.delegatedVotingPower, 18),
      tokenDelegatedOthers: new Amount(
        tokenVotes.delegatedVotingPower -
          (tokenVotes.delegates === userAddress ? tokenVotes.votingPower : 0n),
        18,
      ),
      tokenDelegatedSelf: new Amount(
        tokenVotes.delegates === userAddress ? tokenVotes.votingPower : 0n,
        18,
      ),
      tokenUndelegated: new Amount(
        tokenVotes.delegates === zeroAddress ? tokenVotes.votingPower : 0n,
        18,
      ),

      stakingDelegated: new Amount(
        votingPowers.stakingVotes.delegatedVotingPower,
        18,
      ),

      totalDelegated: new Amount(
        votingPowers.claimsVotes.delegatedVotingPower +
          tokenVotes.delegatedVotingPower +
          votingPowers.stakingVotes.delegatedVotingPower,
        18,
      ),

      totalDelegatedOthers: new Amount(
        votingPowers.claimsVotes.delegatedVotingPower -
          (votingPowers.claimsVotes.delegates === userAddress
            ? votingPowers.claimsVotes.votingPower
            : 0n) +
          (tokenVotes.delegatedVotingPower -
            (tokenVotes.delegates === userAddress
              ? tokenVotes.votingPower
              : 0n)),
        18,
      ),

      totalDelegatedSelf: new Amount(
        (votingPowers.claimsVotes.delegates === userAddress
          ? votingPowers.claimsVotes.votingPower
          : 0n) +
          (tokenVotes.delegates === userAddress ? tokenVotes.votingPower : 0n) +
          votingPowers.stakingVotes.delegatedVotingPower,
        18,
      ),
    };
  });
}
