import { type Address, zeroAddress } from "viem";
import type { MoonwellClient } from "../../client/createMoonwellClient.js";
import { Amount, getEnvironmentsFromArgs } from "../../common/index.js";
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

  /** Block number **/
  blockNumber?: bigint;
};

export type GetUserVotingPowersReturnType = Promise<UserVotingPowers[]>;

export async function getUserVotingPowers<
  environments,
  Network extends Chain | undefined,
>(
  client: MoonwellClient,
  args: GetUserVotingPowersParameters<environments, Network>,
): GetUserVotingPowersReturnType {
  const { governanceToken, userAddress, blockNumber } = args;

  const environments = getEnvironmentsFromArgs(client, args);

  const tokenEnvironments = environments.filter(
    (env) => env.custom?.governance?.token === governanceToken,
  );

  const environmentsUserVotingPowers = await Promise.all(
    tokenEnvironments.map((environment) =>
      environment.contracts.views?.read.getUserVotingPower([userAddress], {
        blockNumber,
      }),
    ),
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
