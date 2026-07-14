---
"@moonwell-fi/moonwell-sdk": patch
---

Dedupe Merkl reward breakdowns across pages so staking rewards are no longer inflated (MOO-587). The Merkl `/rewards` endpoint clamps an out-of-range `breakdownPage` back to page 0 instead of returning an empty page, so `getMerklRewardsData` appended the same breakdowns on every page and multiplied the reported staking rewards by the page count (the app showed 7,648 WELL vs Merkl's 764.9, ~10x). `getMerklRewardsData` now seeds a seen-set from page 0 and only appends breakdowns it has not already collected, stopping as soon as a page contributes nothing new; genuinely paginated, distinct breakdowns are still merged. No public API changes.
