import type { Environment } from "../../environments/index.js";
import { getWithRetry } from "../axiosWithRetry.js";
import type { ApiProposal } from "./governor-api-client.js";

const PINATA_GATEWAY = "https://d4529a05.mypinata.cloud/ipfs";

// IPFS content is content-addressed, so a per-hash result is immutable and the
// cache lives for the process lifetime — no TTL needed. Repeated getProposals()
// calls in the same Node/browser session reuse the resolved markdown.
const ipfsContentCache = new Map<string, string>();

/**
 * Strip the `ipfs://` prefix from an indexer-supplied URI. Returns null for
 * anything that isn't an IPFS URI (including empty strings and undefined),
 * which lets callers skip the fetch with a single check.
 */
export const parseIpfsHash = (uri: string | undefined): string | null => {
  if (!uri) return null;
  return uri.match(/^ipfs:\/\/(.+)$/)?.[1] ?? null;
};

/**
 * Fetch a single IPFS resource via the Pinata gateway. Cached by hash.
 *
 * `responseType: "text"` disables axios's default JSON auto-parse so we keep
 * the markdown body verbatim. We additionally reject non-string responses so
 * an HTML error page or JSON payload doesn't poison the cache as
 * `"[object Object]"` — the caller's per-proposal catch keeps the `ipfs://`
 * URI in place when that happens.
 */
export const fetchIpfsContent = async (hash: string): Promise<string> => {
  const cached = ipfsContentCache.get(hash);
  if (cached !== undefined) return cached;

  const response = await getWithRetry<string>(`${PINATA_GATEWAY}/${hash}`, {
    responseType: "text",
  });
  if (typeof response.data !== "string") {
    throw new Error(
      `[fetchIpfsContent] non-string body for hash=${hash} (typeof=${typeof response.data})`,
    );
  }
  ipfsContentCache.set(hash, response.data);
  return response.data;
};

/**
 * For every proposal whose `description` is an `ipfs://` URI, fetch the
 * underlying markdown from Pinata and replace `description` in place. All
 * fetches run in parallel.
 *
 * Failures are logged via console.warn AND surfaced through
 * `env.onError` (matching the convention used by `getProposalsOnChainData` /
 * `readCrossChainQuorums`), then swallowed per-proposal: the `ipfs://` URI
 * is left untouched so consumers can detect (e.g. via
 * `description.startsWith("ipfs://")`) and render a fallback. The bulk call
 * never rejects, so a single bad pin doesn't kill `getProposals()` for
 * everyone.
 */
export const resolveIpfsDescriptions = async (
  proposals: ApiProposal[],
  env: Environment,
): Promise<void> => {
  await Promise.all(
    proposals.map(async (proposal) => {
      const hash = parseIpfsHash(proposal.description);
      if (!hash) return;
      try {
        proposal.description = await fetchIpfsContent(hash);
      } catch (error) {
        console.warn(
          `[resolveIpfsDescriptions] failed to fetch hash=${hash}:`,
          error,
        );
        env.onError?.(error, {
          source: "governance-ipfs-description",
          chainId: proposal.chainId,
        });
      }
    }),
  );
};
