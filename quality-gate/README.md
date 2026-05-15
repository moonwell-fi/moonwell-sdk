# Quality Gate

Ratchet-style quality gate: PRs may hold or improve four signals against a committed baseline, never regress them.

## Metrics tracked

`baseline.json` is the human-approved floor. It captures:

- **`coverage`** — vitest v8 coverage percentages (`lines`, `statements`, `functions`, `branches`). Sourced from `coverage/coverage-summary.json`.
- **`lint`** — biome diagnostic counts (`errors`, `warnings`). Sourced from `.gate/lint.json` (biome's JSON reporter).
- **`audit`** — pnpm advisory counts by severity (`critical`, `high`, `moderate`, `low`). Sourced from `.gate/audit.json` (`pnpm audit --json`).
- **`duplication`** — jscpd statistics (`percentage`, `clones`, `duplicatedLines`). Sourced from `.gate/jscpd/jscpd-report.json`.

Only `critical` and `high` audit counts are enforced by the gate; `moderate` and `low` are recorded for visibility but do not fail the build.

## Collectors and output paths

| Script               | Output                          |
| -------------------- | ------------------------------- |
| `pnpm lint:gate`     | `.gate/lint.json`               |
| `pnpm test:coverage` | `coverage/coverage-summary.json` |
| `pnpm gate:jscpd`    | `.gate/jscpd/jscpd-report.json` |
| `pnpm gate:audit`    | `.gate/audit.json`              |
| `pnpm gate`          | `.gate/report.md`, `.gate/metrics-summary.json` |

## Tolerances

Tolerances absorb measurement noise from minor refactors:

- Coverage: **0.5pp** grace (current may dip up to half a percentage point below baseline)
- Duplication percentage: **0.1pp** grace
- Lint errors/warnings, audit advisory counts, and duplication clone counts: **exact**

## Local usage

```sh
pnpm gate:run               # run every collector, then compare to baseline.json
pnpm gate:update-baseline   # re-capture all metrics into baseline.json (after intentionally raising the floor)
pnpm gate                   # compare existing collector outputs only (assumes you've already run gate:run once)
```

Use `gate:update-baseline` when you have intentionally improved a metric (added tests, fixed advisories, removed duplication). Commit the updated `baseline.json` as part of the PR that earned it.

The gate exits **0** on PASS, **1** on FAIL, **2** if `baseline.json` is missing, and **3** if no metric produced usable data (INCONCLUSIVE — likely a broken collector).

## Rules

- **Never lower `baseline.json` to bypass the gate.** The baseline is a human-approved snapshot; lowering it to make a PR pass is exactly the regression the gate exists to prevent.
- `gate:update-baseline` refuses to write if any collector returned no usable data — this keeps broken collectors from silently locking in zero-floor values.
- The CI job posts a sticky markdown comment on every PR and uploads the raw collector outputs as artifacts. Branch protection must mark the `gate` check as **Required** for the gate to actually block merges; without that, the gate is advisory only.
