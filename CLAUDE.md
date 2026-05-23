## Project Overview

`@moonwell-fi/moonwell-sdk` is a published TypeScript SDK for the Moonwell protocol. It's a pnpm workspace monorepo with three packages: `src` (the published library), `test` (shared test setup/config), and `site` (vocs-powered docs). The library ships dual ESM + CJS + type-definition bundles via `tsc`. Releases go out through Changesets and publish to npm with provenance.

Stack: TypeScript, vitest (v8 coverage), biome (lint + format), sherif (monorepo lint), husky + lint-staged, Changesets, publint + @arethetypeswrong/cli for package validity, pnpm 9.

## Git

Do not add Co-Authored-By or other AI attribution trailers to commit messages unless explicitly asked.

When reviewing PRs, always ask for the specific PR number upfront rather than listing all PRs first.

The default branch is `main`. Releases follow Changesets — never hand-edit `CHANGELOG.md` or bump versions in `package.json`; run `pnpm changeset:version` and let the workflow do it.

## Scripts & Commands

- `pnpm lint` — Biome check + autofix on source
- `pnpm lint:repo` — Sherif monorepo structure lint
- `pnpm format` — Biome format
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm build` — clean + emit CJS / ESM / types into `src/_cjs`, `src/_esm`, `src/_types`
- `pnpm test` — vitest watch mode (uses `test/vitest.config.ts`)
- `pnpm test:coverage` — vitest run with v8 coverage; writes to `./coverage`
- `pnpm test:build` — `publint` + `attw` over the build output (validates the published package shape)

Always run `pnpm typecheck` after making code changes. Fix all TypeScript errors before presenting work as complete.

## Quality Gate

A ratchet-style pipeline prevents PRs from regressing project metrics. It tracks four signals against a committed baseline: test coverage, lint violations, pnpm audit advisories, and code duplication (jscpd). A PR fails the gate if any metric gets worse; it can only hold or improve.

Source of truth: `quality-gate/baseline.json`. The gate script lives at `scripts/quality-gate.mjs`; collector configs in `.jscpd.json` and `test/vitest.config.ts`; the PR workflow in `.github/workflows/quality-gate.yml`.

Local scripts:

- `pnpm gate` — compare current collector outputs to `baseline.json` (assumes you've already run `gate:run` once)
- `pnpm gate:run` — run all collectors then the comparison; use this before pushing
- `pnpm gate:update-baseline` — re-capture metrics into `baseline.json` after you've intentionally raised the floor (added tests, fixed advisories, removed duplication). Commit the updated baseline as part of the PR that earned it.

In CI, `quality-gate.yml` runs on every PR against `main`, posts a sticky comment with the metric table, and uploads the raw collector outputs as artifacts.

Coverage scope note: vitest is configured with `all: false` and an explicit `include` array — coverage is collected only from the files those listed tests touch. The baseline reflects that scope, not whole-repo coverage. When adding new tests, prefer extending the `include` array in `test/vitest.config.ts` so the new tests are counted.

Rules:

- **Never edit `quality-gate/baseline.json` to bypass the gate.** The baseline is a human-approved snapshot; lowering it to make a PR pass is exactly the regression the gate exists to prevent.
- Gate script chains use `;` (not `&&`) so a failing test doesn't block the other collectors. Test failures still show up in CI as a non-zero exit from `pnpm test:coverage`, but coverage is still recorded thanks to `reportOnFailure: true` in vitest config.
- Tolerances absorb measurement noise: 0.5pp grace on coverage, 0.1pp on duplication %. Lint, audit counts, and clone counts are exact.
- Audit gating covers `critical` and `high` advisories only — `moderate` and `low` counts are recorded in the baseline for visibility but are not enforced.

## Workflow Preferences

When asked to implement something, write code immediately. Do not spend time writing planning documents or staying in plan mode unless the user explicitly asks for a plan first.

## Code Conventions

### Imports

- Within `src/`, use relative imports — this is a published library and `@/` aliases would break consumers. Verify by checking that bundled `_esm`/`_cjs` output paths resolve without the host having any path-alias config.
- Internal-only test helpers are reachable via the `~test` alias defined in `test/vitest.config.ts`.

### TypeScript

- Target is `5.0.4+` (peer dep). Stick to features that compile cleanly under that floor; CI runs a typecheck matrix from 5.0.4 to 5.5.2 via `verify.yml`.
- Public exports are validated by `publint` and `attw` (`pnpm test:build`). If you add a new exported entry point, run that script before pushing.
- No non-null assertions (`!`) — use optional chaining or nullish coalescing.
- No type assertions (`as Type`) — restructure to avoid casts. Acceptable in test files.
- Explicit return types on all exported functions.
- Exhaustive `switch` — cover every case, no `default` catch-all.

### Build artifacts

- `src/_cjs/`, `src/_esm/`, `src/_types/` are gitignored generated output. Never hand-edit them.
- The build commands set `verbatimModuleSyntax false` for CJS only; ESM keeps it strict. Don't move imports between `type` and value to "fix" CJS errors without checking ESM still passes.

### Testing

- Tests live next to source as `*.test.ts`. The vitest config has an explicit `include` list — new test files must be added to that array to run.
- Coverage is gated by the quality gate (see above). Adding tests that increase coverage is encouraged; the baseline locks each step in.
- `vitest` is the test runner; do not introduce `jest` or other runners.

### Linting

- Biome (`pnpm lint`) is the formatter and primary linter.
- Sherif (`pnpm lint:repo`) enforces workspace-level conventions — listed dependencies, version consistency across packages.
- lint-staged + husky run biome on staged `.ts` files at pre-commit. Do not bypass with `--no-verify` unless the user explicitly asks.

## PR Reviews

When asked to review a PR, follow this checklist:

1. Bugs, logic errors, edge cases
2. Public API impact — anything renamed, removed, or made stricter is a breaking change for consumers. Confirm a Changeset captures it.
3. Test coverage for changed code (and that new tests are added to `test/vitest.config.ts` include)
4. Build artifact health: does `pnpm build && pnpm test:build` still pass?
5. Adherence to project conventions (see Code Conventions above)

Use this output structure:

### Summary

One-paragraph description of what the PR does, with attention to whether it changes the public API.

### Issues

Categorise as 🔴 Critical, 🟡 Major, or 🔵 Minor. Include file path and line numbers.

For each issue with a concrete fix, include a "Suggested prompt" fenced code block (` ```text `) the developer can paste into Claude Code. Reference exact file paths and describe the change precisely — no raw diffs.

### Positive observations

Call out good patterns or improvements.

### Suggestions

Optional improvements that are not blocking. Include a suggested prompt for each.

Be constructive, specific, and concise.
