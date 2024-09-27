import type { UserVotingPowers } from "@/types/userVotingPowers.js";
import { Amount } from "@moonwell-sdk/common";
import type { Environment, GovernanceToken } from "@moonwell-sdk/environments";
import { zeroAddress } from "viem";

export type GetUserVotingPowersType = UserVotingPowers[];

export async function getUserVotingPowers(params: {
  environments: Environment[];
  user: `0x${string}`;
  governanceToken: GovernanceToken;
}): Promise<GetUserVotingPowersType | undefined> {
  const tokenEnvironments = params.environments.filter((env) => env.config.settings?.governance?.token === params.governanceToken);

  const environmentsUserVotingPowers = await Promise.all(
    tokenEnvironments.map((environment) => environment.contracts.core?.views?.read.getUserVotingPower([params.user])),
  );

  return tokenEnvironments.map((environment, index) => {
    const votingPowers = environmentsUserVotingPowers[index]!;

    return {
      chainId: environment.chain.id,

      //Claims balances
      claimsDelegates: votingPowers.claimsVotes.delegates,
      claimsBalance: new Amount(votingPowers.claimsVotes.votingPower, 18),
      claimsDelegated: new Amount(votingPowers.claimsVotes.delegatedVotingPower, 18),
      claimsDelegatedOthers: new Amount(
        votingPowers.claimsVotes.delegatedVotingPower -
          (votingPowers.claimsVotes.delegates === params.user ? votingPowers.claimsVotes.votingPower : 0n),
        18,
      ),
      claimsDelegatedSelf: new Amount(votingPowers.claimsVotes.delegates === params.user ? votingPowers.claimsVotes.votingPower : 0n, 18),

      claimsUndelegated: new Amount(votingPowers.claimsVotes.delegates === zeroAddress ? votingPowers.claimsVotes.votingPower : 0n, 18),

      //Token balances
      tokenDelegates: votingPowers.tokenVotes.delegates,
      tokenBalance: new Amount(votingPowers.tokenVotes.votingPower, 18),
      tokenDelegated: new Amount(votingPowers.tokenVotes.delegatedVotingPower, 18),
      tokenDelegatedOthers: new Amount(
        votingPowers.tokenVotes.delegatedVotingPower -
          (votingPowers.tokenVotes.delegates === params.user ? votingPowers.tokenVotes.votingPower : 0n),
        18,
      ),
      tokenDelegatedSelf: new Amount(votingPowers.tokenVotes.delegates === params.user ? votingPowers.tokenVotes.votingPower : 0n, 18),
      tokenUndelegated: new Amount(votingPowers.tokenVotes.delegates === zeroAddress ? votingPowers.tokenVotes.votingPower : 0n, 18),

      stakingDelegated: new Amount(votingPowers.stakingVotes.delegatedVotingPower, 18),

      totalDelegated: new Amount(
        votingPowers.claimsVotes.delegatedVotingPower +
          votingPowers.tokenVotes.delegatedVotingPower +
          votingPowers.stakingVotes.delegatedVotingPower,
        18,
      ),

      totalDelegatedOthers: new Amount(
        votingPowers.claimsVotes.delegatedVotingPower -
          (votingPowers.claimsVotes.delegates === params.user ? votingPowers.claimsVotes.votingPower : 0n) +
          (votingPowers.tokenVotes.delegatedVotingPower -
            (votingPowers.tokenVotes.delegates === params.user ? votingPowers.tokenVotes.votingPower : 0n)),
        18,
      ),

      totalDelegatedSelf: new Amount(
        (votingPowers.claimsVotes.delegates === params.user ? votingPowers.claimsVotes.votingPower : 0n) +
          (votingPowers.tokenVotes.delegates === params.user ? votingPowers.tokenVotes.votingPower : 0n) +
          votingPowers.stakingVotes.delegatedVotingPower,
        18,
      ),
    };
  });
}
