## Project Overview

This is a TypeScript SDK for the Moonwell protocol. It uses pnpm as the package manager, Biome for linting/formatting, and builds to CJS, ESM, and type declaration outputs via tsc.

## Git

Do not add Co-Authored-By or other AI attribution trailers to commit messages unless explicitly asked.

When reviewing PRs, always ask for the specific PR number upfront rather than listing all PRs first.

## Scripts & Commands

- `pnpm build` — full build (CJS + ESM + types)
- `pnpm lint` — Biome check + autofix
- `pnpm format` — Biome format
- `pnpm test` — run tests
- `pnpm test:build` — verify package exports (publint + attw)

Always run `pnpm tsc --noEmit` after making code changes. Fix all TypeScript errors before presenting work as complete.

## Workflow Preferences

When asked to implement something, write code immediately. Do not spend time writing planning documents or staying in plan mode unless the user explicitly asks for a plan first.

## Code Conventions

### Imports
- No relative imports across package boundaries
- Use explicit file extensions where required by ESM output

### TypeScript
- No non-null assertions (`!`) — use optional chaining or nullish coalescing
- No type assertions (`as Type`) — restructure to avoid casts
- Explicit return types on all exported functions
- Exhaustive `switch` — cover every case, no `default` catch-all
- No empty functions — use `() => undefined` if needed
- Prefix intentionally unused variables with `_`

### Structure
- Public API exports: `src/index.ts`
- Actions: `src/actions/`
- Client: `src/client/`
- Environments (chain configs): `src/environments/`
- Shared types/utils: `src/common/`
- Error types: `src/errors/`

### Testing
- Type assertions (`as`) are acceptable inside test files

## PR Reviews

When asked to review a PR, follow this checklist:
1. Bugs, logic errors, edge cases
2. Security (XSS, injection, exposed secrets)
3. Performance regressions
4. Test coverage for changed code
5. Adherence to project conventions (see Code Conventions above)

Use this output structure:

### Summary
One-paragraph description of what the PR does.

### Issues
Categorise as 🔴 Critical, 🟡 Major, or 🔵 Minor.
Include file path and line numbers.

For each issue that has a concrete fix, include a "Suggested prompt"
fenced code block (```text) containing a self-contained instruction
the developer can copy-paste into Claude Code to apply the fix.
The prompt should reference exact file paths and describe the change
precisely — do NOT include raw code diffs, just the instruction.

Example:
```text
In src/actions/foo.ts, the function on line 42 is missing
error handling. Add try/catch and surface the error correctly.
```

### Positive observations
Call out good patterns or improvements.

### Suggestions
Optional improvements that are not blocking.
Include a suggested prompt (same format as above) for each suggestion.

Be constructive, specific, and concise.
