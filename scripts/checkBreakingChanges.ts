import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");

// ANSI color codes
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

// Built dynamically to avoid Biome's noControlCharactersInRegex rule.
const ANSI_RE = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");

function stripAnsi(s: string): string {
  return s.replace(ANSI_RE, "");
}

function git(...args: string[]): string {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  return result.stdout ?? "";
}

// Returns whether any changeset on disk declares a `minor` or `major` bump.
// Changesets persist until `pnpm changeset:version` consumes them.
function hasSufficientChangeset(): boolean {
  const changesetDir = join(root, ".changeset");
  if (!existsSync(changesetDir)) return false;

  const files = readdirSync(changesetDir).filter(
    (f) => f.endsWith(".md") && f !== "README.md",
  );

  return files.some((f) => {
    const content = readFileSync(join(changesetDir, f), "utf8");
    // Frontmatter format: ---\n"pkg": major|minor|patch\n---
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return false;
    return match[1]
      .split("\n")
      .some((line) => line.endsWith(": major") || line.endsWith(": minor"));
  });
}

function hasAnyChangesetFile(): boolean {
  const changesetDir = join(root, ".changeset");
  if (!existsSync(changesetDir)) return false;
  return readdirSync(changesetDir).some(
    (f) => f.endsWith(".md") && f !== "README.md",
  );
}

// Get staged diff for src/index.ts and find removed export names.
function getRemovedExports(): string[] {
  const diff = git("diff", "--cached", "--unified=0", "--", "src/index.ts");
  if (!diff) return [];

  const removed: string[] = [];

  for (const line of diff.split("\n")) {
    if (!line.startsWith("-")) continue;
    // Match: -export { Foo, type Bar } or -  Foo,
    const exportBlock = line.match(/^-export\s*\{([^}]+)\}/);
    if (exportBlock) {
      for (const name of exportBlock[1].split(",")) {
        const clean = name.replace(/\btype\b/g, "").trim();
        if (clean) removed.push(clean);
      }
      continue;
    }
    // Match single-name export line inside a multi-line block: -  SomeName,
    const inlineMatch = line.match(/^-\s+([\w]+),?\s*$/);
    if (inlineMatch) {
      removed.push(inlineMatch[1]);
    }
  }

  return removed;
}

// Check staged type files for removed fields in exported interfaces/types.
function getRemovedTypeFields(): string[] {
  const diff = git(
    "diff",
    "--cached",
    "--unified=0",
    "--",
    "src/types",
    "src/environments/types",
    "src/client",
  );
  if (!diff) return [];

  const removed: string[] = [];
  let currentFile = "";

  for (const line of diff.split("\n")) {
    if (line.startsWith("+++ b/")) {
      currentFile = line.slice(6);
      continue;
    }
    if (!line.startsWith("-")) continue;
    // Match removed field: -  fieldName: Type or -  fieldName?: Type
    const fieldMatch = line.match(/^-\s{2,}(\w+)\??:/);
    if (fieldMatch) {
      removed.push(`${currentFile}: ${fieldMatch[1]}`);
    }
  }

  return removed;
}

const removedExports = getRemovedExports();
const removedFields = getRemovedTypeFields();
const hasBreakingChanges =
  removedExports.length > 0 || removedFields.length > 0;

if (!hasBreakingChanges) process.exit(0);
if (hasSufficientChangeset()) process.exit(0);

const anyChangeset = hasAnyChangesetFile();

const border = "═".repeat(58);
const headline = anyChangeset
  ? `⚠  BREAKING CHANGE — changeset must be bumped to ${BOLD}minor${RESET}${RED}${BOLD} or ${BOLD}major${RESET}${RED}${BOLD}`
  : "⚠  BREAKING CHANGE DETECTED — no changeset found";
const lines: string[] = [
  `${BOLD}${YELLOW}╔${border}╗${RESET}`,
  `${BOLD}${YELLOW}║${RESET}  ${RED}${BOLD}${headline}${RESET}  ${BOLD}${YELLOW}║${RESET}`,
  `${BOLD}${YELLOW}╠${border}╣${RESET}`,
];

if (removedExports.length > 0) {
  lines.push(
    `${BOLD}${YELLOW}║${RESET}  Removed/renamed exports:${" ".repeat(31)}${BOLD}${YELLOW}║${RESET}`,
  );
  for (const name of removedExports) {
    const padded = `    - ${name}`.padEnd(59);
    lines.push(`${BOLD}${YELLOW}║${RESET}${padded}${BOLD}${YELLOW}║${RESET}`);
  }
}

if (removedFields.length > 0) {
  lines.push(
    `${BOLD}${YELLOW}║${RESET}  Removed type fields:${" ".repeat(36)}${BOLD}${YELLOW}║${RESET}`,
  );
  for (const field of removedFields) {
    const padded = `    - ${field}`.padEnd(59);
    lines.push(`${BOLD}${YELLOW}║${RESET}${padded}${BOLD}${YELLOW}║${RESET}`);
  }
}

lines.push(`${BOLD}${YELLOW}╠${border}╣${RESET}`);
const action = anyChangeset
  ? `Update your changeset bump type to ${BOLD}minor${RESET} or ${BOLD}major${RESET}.`
  : `Run: ${BOLD}pnpm changeset${RESET}  and select ${BOLD}minor${RESET} or ${BOLD}major${RESET}.`;
const padding = " ".repeat(Math.max(0, 57 - stripAnsi(action).length));
lines.push(
  `${BOLD}${YELLOW}║${RESET}  ${action}${padding}${BOLD}${YELLOW}║${RESET}`,
);
lines.push(`${BOLD}${YELLOW}╚${border}╝${RESET}`);

process.stderr.write(`\n${lines.join("\n")}\n\n`);

// Exit 0 — warn only, do not block the commit.
process.exit(0);
