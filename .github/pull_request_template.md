<!-- Keep the summary short; reviewers read the diff. The checklist below is
the contract — items exist because skipping them has caused production
incidents (see MOO-351, the proposal-171 governance outage). -->

## Summary

<!-- What changes and why. Call out public-API impact explicitly. -->

## Checklist

- [ ] **Changeset** added (`pnpm changeset`) if anything consumer-visible changed — including behavioral changes with no signature change (e.g. "no longer rejects, returns partial results").
- [ ] **Predicate rule**: if this PR adds or changes a predicate/heuristic/classifier (`is*`, `*Aware`, `classify*`, `resolve*Route`), I enumerated its **FALSE branch**: listed the real-world inputs that return false, confirmed each is *supposed* to, and added a test pinning at least one. *(The proposal-171 incident shipped through review because `isMultichainProposal`'s false branch — a hub proposal with no bridge target — was never enumerated.)*
- [ ] **Misclassification table**: any new heuristic ships with a table (in the PR description or test file) of representative inputs → classification, including at least one input the heuristic is known to get wrong or be uncertain about.
- [ ] **No silent failures**: no new early-`return` / swallowed catch on a path a user action depends on. Failures either propagate, report via `env.onError`, or are explicitly documented as intentional skips.
- [ ] **Multi-chain isolation**: any new multi-chain fan-out uses `Promise.allSettled` (or per-chain try/catch) unless all-or-nothing semantics are explicitly required and documented.
- [ ] **Tests added to the vitest include list** (`test/vitest.config.ts`) — test files not in the array do not run in CI.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm gate:run` pass locally.

## First-of-its-kind inputs

<!-- Does this change handle a NEW input class (new proposal topology, new
chain, new token, re-enabled feature)? If yes: what exercises that class
end-to-end before it occurs in production? Link the launch-gate issue. -->
