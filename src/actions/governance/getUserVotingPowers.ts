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

  const tokenEnvironments = environments.filter(
    (env) => env.custom?.governance?.token === governanceToken,
  );

  const perChainBlockNumbers =
    snapshotTimestamp !== undefined
      ? await Promise.all(
          tokenEnvironments.map((env) =>
            getBlockNumberAtTimestamp(
              env.publicClient,
              BigInt(snapshotTimestamp),
            ),
          ),
        )
      : undefined;

  const environmentsUserVotingPowers = await Promise.all(
    tokenEnvironments.map((environment, index) => {
      const blockForChain = perChainBlockNumbers
        ? perChainBlockNumbers[index]
        : blockNumber;
      return environment.contracts.views?.read.getUserVotingPower(
        [userAddress],
        {
          blockNumber: blockForChain,
        },
      );
    }),
  );

  return tokenEnvironments.map((environment, index) => {
    const votingPowers = environmentsUserVotingPowers[index]!;

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
