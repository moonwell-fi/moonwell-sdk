import axios from "axios";
import type { Environment } from "../../environments/index.js";

/**
 * Base configuration for Governor API requests
 * The Governor API is the new governance indexer, accessed via governanceIndexerUrl
 */
const getGovernorApiUrl = (environment: Environment): string => {
  return environment.governanceIndexerUrl;
};

/**
 * Paginated response type
 */
export type PaginatedResponse<T> = {
  results: T[];
  nextCursor?: string;
};

/**
 * Pagination options
 */
export type PaginationOptions = {
  limit?: number;
  cursor?: string | undefined;
};

/**
 * Raw API response types matching Governor API spec
 */
export type ApiProposal = {
  id: string;
  chainId: number;
  proposalId: number;
  proposer: string;
  targets: string[];
  values: string[];
  calldatas: string[];
  votingStartTime: number;
  votingEndTime: number;
  description: string;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  blockNumber: string;
  timestamp: number;
  transactionHash: string;
  stateChanges?: ApiProposalStateChange[];
};

export type ApiVote = {
  id: string;
  proposalId: string;
  voter: string;
  votes: string; // Raw vote weight (NOT scaled)
  voteValue: number; // 0=for, 1=against, 2=abstain
  blockNumber: string;
  chainId: number;
  timestamp: number;
  proposalForVotes: number;
  proposalAgainstVotes: number;
  proposalAbstainVotes: number;
};

export type ApiVoter = {
  id: string;
  firstSeenBlock: string;
  firstSeenTimestamp: number;
  votedProposalIds: string[];
  createdProposalIds: string[];
};

export type ApiProposalStateChange = {
  id: string;
  proposalId: string;
  state: "CREATED" | "CANCELED" | "EXECUTED" | "QUEUED" | "REBROADCASTED";
  blockNumber: string;
  timestamp: number;
  transactionHash: string;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  chainId: number; // Chain ID where this state change occurred
};

/**
 * Fetch proposals from Governor API
 */
export async function fetchProposals(
  environment: Environment,
  options?: PaginationOptions & { chainId?: number },
): Promise<PaginatedResponse<ApiProposal>> {
  const baseUrl = getGovernorApiUrl(environment);
  const params = new URLSearchParams();

  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.cursor) params.append("cursor", options.cursor);
  if (options?.chainId) params.append("chainId", options.chainId.toString());

  const response = await axios.get<PaginatedResponse<ApiProposal>>(
    `${baseUrl}/api/v1/governor/proposals?${params.toString()}`,
  );

  if (response.status !== 200 || !response.data) {
    throw new Error(`Failed to fetch proposals: ${response.statusText}`);
  }

  return response.data;
}

/**
 * Fetch all proposals (handles pagination internally)
 */
export async function fetchAllProposals(
  environment: Environment,
  options?: { chainId?: number },
): Promise<ApiProposal[]> {
  const allProposals: ApiProposal[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await fetchProposals(environment, {
      limit: 1000,
      ...(cursor && { cursor }),
      ...(options?.chainId && { chainId: options.chainId }),
    });

    allProposals.push(...response.results);
    cursor = response.nextCursor;
  } while (cursor);

  return allProposals;
}

/**
 * Fetch a single proposal from Governor API
 */
export async function fetchProposal(
  environment: Environment,
  proposalId: string,
): Promise<ApiProposal> {
  const baseUrl = getGovernorApiUrl(environment);

  const response = await axios.get<ApiProposal>(
    `${baseUrl}/api/v1/governor/proposals/${proposalId}`,
  );

  if (response.status !== 200 || !response.data) {
    throw new Error(`Failed to fetch proposal: ${response.statusText}`);
  }

  return response.data;
}

/**
 * Fetch votes for a proposal
 */
export async function fetchProposalVotes(
  environment: Environment,
  proposalId: string,
  options?: PaginationOptions,
): Promise<PaginatedResponse<ApiVote>> {
  const baseUrl = getGovernorApiUrl(environment);
  const params = new URLSearchParams();

  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.cursor) params.append("cursor", options.cursor);

  const response = await axios.get<PaginatedResponse<ApiVote>>(
    `${baseUrl}/api/v1/governor/proposals/${proposalId}/votes?${params.toString()}`,
  );

  if (response.status !== 200 || !response.data) {
    throw new Error(`Failed to fetch proposal votes: ${response.statusText}`);
  }

  return response.data;
}

/**
 * Fetch all votes for a proposal (handles pagination internally)
 */
export async function fetchAllProposalVotes(
  environment: Environment,
  proposalId: string,
): Promise<ApiVote[]> {
  const allVotes: ApiVote[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await fetchProposalVotes(environment, proposalId, {
      limit: 1000,
      ...(cursor && { cursor }),
    });

    allVotes.push(...response.results);
    cursor = response.nextCursor;
  } while (cursor);

  return allVotes;
}

/**
 * Fetch state changes for a proposal
 */
export async function fetchProposalStateChanges(
  environment: Environment,
  proposalId: string,
  options?: PaginationOptions,
): Promise<PaginatedResponse<ApiProposalStateChange>> {
  const baseUrl = getGovernorApiUrl(environment);
  const params = new URLSearchParams();

  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.cursor) params.append("cursor", options.cursor);

  const response = await axios.get<PaginatedResponse<ApiProposalStateChange>>(
    `${baseUrl}/api/v1/governor/proposals/${proposalId}/state-changes?${params.toString()}`,
  );

  if (response.status !== 200 || !response.data) {
    throw new Error(
      `Failed to fetch proposal state changes: ${response.statusText}`,
    );
  }

  return response.data;
}

/**
 * Fetch all state changes for a proposal (handles pagination internally)
 */
export async function fetchAllProposalStateChanges(
  environment: Environment,
  proposalId: string,
): Promise<ApiProposalStateChange[]> {
  const allStateChanges: ApiProposalStateChange[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await fetchProposalStateChanges(environment, proposalId, {
      limit: 1000,
      ...(cursor && { cursor }),
    });

    allStateChanges.push(...response.results);
    cursor = response.nextCursor;
  } while (cursor);

  return allStateChanges;
}

/**
 * Fetch all voters (delegates)
 */
export async function fetchVoters(
  environment: Environment,
  options?: PaginationOptions,
): Promise<PaginatedResponse<ApiVoter>> {
  const baseUrl = getGovernorApiUrl(environment);
  const params = new URLSearchParams();

  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.cursor) params.append("cursor", options.cursor);

  const endpoint = `${baseUrl}/api/v1/governor/voters?${params.toString()}`;
  console.log("[Governor API] Fetching voters from:", endpoint);

  try {
    const response = await axios.get<PaginatedResponse<ApiVoter>>(endpoint);

    if (response.status !== 200 || !response.data) {
      throw new Error(`Failed to fetch voters: ${response.statusText}`);
    }

    console.log(
      "[Governor API] Successfully fetched voters:",
      response.data.results?.length,
      "voters",
    );
    return response.data;
  } catch (error: any) {
    console.error("[Governor API] CORS/Network Error:", {
      message: error.message,
      code: error.code,
      endpoint,
      error: error.response || error,
    });
    throw new Error(
      `CORS or Network error when fetching voters. The API at ${baseUrl} may need CORS headers configured. Original error: ${error.message}`,
    );
  }
}

/**
 * Fetch all voters (handles pagination internally)
 */
export async function fetchAllVoters(
  environment: Environment,
): Promise<ApiVoter[]> {
  const allVoters: ApiVoter[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await fetchVoters(environment, {
      limit: 1000,
      ...(cursor && { cursor }),
    });

    allVoters.push(...response.results);
    cursor = response.nextCursor;
  } while (cursor);

  return allVoters;
}

/**
 * Fetch a single voter
 */
export async function fetchVoter(
  environment: Environment,
  address: string,
): Promise<ApiVoter> {
  const baseUrl = getGovernorApiUrl(environment);

  const response = await axios.get<ApiVoter>(
    `${baseUrl}/api/v1/governor/voters/${address}`,
  );

  if (response.status === 404) {
    throw new Error("Voter not found");
  }

  if (response.status !== 200 || !response.data) {
    throw new Error(`Failed to fetch voter: ${response.statusText}`);
  }

  return response.data;
}

/**
 * Fetch proposals created by a specific address
 */
export async function fetchVoterProposals(
  environment: Environment,
  address: string,
  options?: PaginationOptions,
): Promise<PaginatedResponse<ApiProposal>> {
  const baseUrl = getGovernorApiUrl(environment);
  const params = new URLSearchParams();

  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.cursor) params.append("cursor", options.cursor);

  const endpoint = `${baseUrl}/api/v1/governor/voters/${address}/proposals?${params.toString()}`;
  console.log("[Governor API] Fetching voter proposals from:", endpoint);

  const response = await axios.get<PaginatedResponse<ApiProposal>>(endpoint);

  if (response.status !== 200 || !response.data) {
    throw new Error(`Failed to fetch voter proposals: ${response.statusText}`);
  }

  return response.data;
}

/**
 * Fetch all proposals created by a specific address (handles pagination internally)
 */
export async function fetchAllVoterProposals(
  environment: Environment,
  address: string,
): Promise<ApiProposal[]> {
  const allProposals: ApiProposal[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await fetchVoterProposals(environment, address, {
      limit: 1000,
      ...(cursor && { cursor }),
    });

    allProposals.push(...response.results);
    cursor = response.nextCursor;
  } while (cursor);

  return allProposals;
}

/**
 * Fetch votes cast by a specific address
 */
export async function fetchVoterVotes(
  environment: Environment,
  address: string,
  options?: PaginationOptions,
): Promise<PaginatedResponse<ApiVote>> {
  const baseUrl = getGovernorApiUrl(environment);
  const params = new URLSearchParams();

  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.cursor) params.append("cursor", options.cursor);

  const endpoint = `${baseUrl}/api/v1/governor/voters/${address}/votes?${params.toString()}`;
  console.log("[Governor API] Fetching voter votes from:", endpoint);

  const response = await axios.get<PaginatedResponse<ApiVote>>(endpoint);

  if (response.status !== 200 || !response.data) {
    throw new Error(`Failed to fetch voter votes: ${response.statusText}`);
  }

  return response.data;
}

/**
 * Fetch all votes cast by a specific address (handles pagination internally)
 */
export async function fetchAllVoterVotes(
  environment: Environment,
  address: string,
): Promise<ApiVote[]> {
  const allVotes: ApiVote[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await fetchVoterVotes(environment, address, {
      limit: 1000,
      ...(cursor && { cursor }),
    });

    allVotes.push(...response.results);
    cursor = response.nextCursor;
  } while (cursor);

  return allVotes;
}
