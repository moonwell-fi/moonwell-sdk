#!/usr/bin/env node
// Quality Gate engine: compares collector outputs against a committed baseline
// and emits a markdown report + JSON summary.
// Exit 0 on PASS, 1 on FAIL, 2 if baseline is missing, 3 if INCONCLUSIVE (no metric produced data).
//
// Usage:
//   node scripts/quality-gate.mjs                  # compare current vs baseline
//   node scripts/quality-gate.mjs --update-baseline # overwrite baseline.json with current metrics
//
// Inputs (all paths relative to repo root):
//   quality-gate/baseline.json
//   coverage/coverage-summary.json
//   .gate/lint.json
//   .gate/audit.json
//   .gate/jscpd/jscpd-report.json
//
// Outputs:
//   .gate/metrics-summary.json
//   .gate/report.md

import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const args = new Set(process.argv.slice(2));
const updateBaseline = args.has("--update-baseline");

const PATHS = {
  baseline: resolve(repoRoot, "quality-gate/baseline.json"),
  coverage: resolve(repoRoot, "coverage/coverage-summary.json"),
  lint: resolve(repoRoot, ".gate/lint.json"),
  audit: resolve(repoRoot, ".gate/audit.json"),
  jscpd: resolve(repoRoot, ".gate/jscpd/jscpd-report.json"),
  metricsSummary: resolve(repoRoot, ".gate/metrics-summary.json"),
  report: resolve(repoRoot, ".gate/report.md"),
};

// Tolerances absorb measurement noise from minor refactors
const TOLERANCE = {
  coveragePp: 0.5,
  duplicationPp: 0.1,
};

function readJsonOrNull(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    console.error(`[gate] Failed to parse ${path}: ${err.message}`);
    return null;
  }
}

function ensureDir(path) {
  mkdirSync(dirname(path), { recursive: true });
}

// Atomic write: write to a temp file then rename, so a crash mid-write can't
// leave a truncated file (matters most for baseline.json, the human-approved
// source of truth).
function atomicWriteFileSync(path, contents) {
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, contents);
  renameSync(tmp, path);
}

function pct(n) {
  return typeof n === "number" ? `${n.toFixed(1)}%` : "—";
}

function num(n) {
  return typeof n === "number" ? String(n) : "—";
}

function delta(current, baseline) {
  if (typeof current !== "number" || typeof baseline !== "number") return "—";
  const d = current - baseline;
  const sign = d > 0 ? "+" : "";
  return `${sign}${d.toFixed(2)}`;
}

function collectCoverage(raw) {
  if (!raw || !raw.total) return null;
  const t = raw.total;
  return {
    lines: t.lines?.pct ?? null,
    statements: t.statements?.pct ?? null,
    functions: t.functions?.pct ?? null,
    branches: t.branches?.pct ?? null,
  };
}

function collectLint(raw) {
  if (!raw) return null;
  // Biome 1.9.4 emits both `summary.{errors,warnings}` and a `diagnostics[]` array.
  // We prefer counting diagnostics by severity (richer signal); `summary` is the
  // fallback for tools/versions that emit only the summary block.
  if (Array.isArray(raw.diagnostics)) {
    let errors = 0;
    let warnings = 0;
    for (const d of raw.diagnostics) {
      const sev = (d.severity ?? "").toLowerCase();
      if (sev === "error" || sev === "fatal") errors++;
      else if (sev === "warning") warnings++;
    }
    return { errors, warnings };
  }
  if (
    raw.summary &&
    typeof raw.summary.errors === "number" &&
    typeof raw.summary.warnings === "number"
  ) {
    return {
      errors: raw.summary.errors,
      warnings: raw.summary.warnings,
    };
  }
  // Unknown shape — return null so the comparison is SKIPPED rather than reporting
  // a false zero. A biome JSON-schema bump should fail loudly, not silently disable gating.
  console.error(
    "[gate] unrecognized lint JSON shape — biome schema may have changed",
  );
  return null;
}

function collectAudit(raw) {
  if (!raw) return null;
  const v = raw.metadata?.vulnerabilities ?? raw.vulnerabilities;
  if (
    !v ||
    typeof v !== "object" ||
    typeof v.critical !== "number" ||
    typeof v.high !== "number" ||
    typeof v.moderate !== "number" ||
    typeof v.low !== "number"
  ) {
    console.error(
      "[gate] unrecognized audit JSON shape — pnpm audit output may have changed",
    );
    return null;
  }
  return {
    critical: v.critical,
    high: v.high,
    moderate: v.moderate,
    low: v.low,
  };
}

function collectDuplication(raw) {
  if (!raw) return null;
  const stats = raw.statistics?.total ?? {};
  return {
    percentage: stats.percentage ?? 0,
    clones: stats.clones ?? 0,
    duplicatedLines: stats.duplicatedLines ?? 0,
  };
}

function gatherCurrent() {
  return {
    coverage: collectCoverage(readJsonOrNull(PATHS.coverage)),
    lint: collectLint(readJsonOrNull(PATHS.lint)),
    audit: collectAudit(readJsonOrNull(PATHS.audit)),
    duplication: collectDuplication(readJsonOrNull(PATHS.jscpd)),
  };
}

// `0` is a valid value here (a zero count is meaningful) so we cannot use falsy checks.
function isMissing(v) {
  return (
    v === null ||
    v === undefined ||
    (typeof v === "number" && !Number.isFinite(v))
  );
}

function compareMetric(name, current, baseline, comparator) {
  if (isMissing(current)) {
    return {
      name,
      current,
      baseline,
      verdict: "SKIPPED",
      reason: "no current data",
    };
  }
  if (isMissing(baseline)) {
    return {
      name,
      current,
      baseline,
      verdict: "SKIPPED",
      reason: "no baseline data",
    };
  }
  const ok = comparator(current, baseline);
  return { name, current, baseline, verdict: ok ? "PASS" : "FAIL" };
}

function buildComparisons(current, baseline) {
  const c = current;
  const b = baseline;
  const comparisons = [];

  const covGate = (cur, base) => cur >= base - TOLERANCE.coveragePp;
  comparisons.push(
    compareMetric(
      "coverage.lines",
      c.coverage?.lines,
      b.coverage?.lines,
      covGate,
    ),
  );
  comparisons.push(
    compareMetric(
      "coverage.statements",
      c.coverage?.statements,
      b.coverage?.statements,
      covGate,
    ),
  );
  comparisons.push(
    compareMetric(
      "coverage.functions",
      c.coverage?.functions,
      b.coverage?.functions,
      covGate,
    ),
  );
  comparisons.push(
    compareMetric(
      "coverage.branches",
      c.coverage?.branches,
      b.coverage?.branches,
      covGate,
    ),
  );

  const leGate = (cur, base) => cur <= base;
  comparisons.push(
    compareMetric("lint.errors", c.lint?.errors, b.lint?.errors, leGate),
  );
  comparisons.push(
    compareMetric("lint.warnings", c.lint?.warnings, b.lint?.warnings, leGate),
  );

  // Audit ratchet: gates critical and high only — moderate/low advisories are
  // recorded in baseline but not enforced. New critical/high advisories fail;
  // pre-existing ones are tolerated until rebaselined.
  comparisons.push(
    compareMetric(
      "audit.critical",
      c.audit?.critical,
      b.audit?.critical,
      leGate,
    ),
  );
  comparisons.push(
    compareMetric("audit.high", c.audit?.high, b.audit?.high, leGate),
  );

  const dupPctGate = (cur, base) => cur <= base + TOLERANCE.duplicationPp;
  comparisons.push(
    compareMetric(
      "duplication.percentage",
      c.duplication?.percentage,
      b.duplication?.percentage,
      dupPctGate,
    ),
  );
  comparisons.push(
    compareMetric(
      "duplication.clones",
      c.duplication?.clones,
      b.duplication?.clones,
      leGate,
    ),
  );

  return comparisons;
}

function formatRow(comp) {
  const isCoverage =
    comp.name.startsWith("coverage.") || comp.name === "duplication.percentage";
  const baselineCell = isCoverage ? pct(comp.baseline) : num(comp.baseline);
  const currentCell = isCoverage ? pct(comp.current) : num(comp.current);
  const deltaSuffix = isCoverage ? "pp" : "";
  const deltaCell = `${delta(comp.current, comp.baseline)}${deltaSuffix}`;
  const icon =
    comp.verdict === "PASS" ? "✅" : comp.verdict === "FAIL" ? "❌" : "⚪";
  return `| ${comp.name} | ${baselineCell} | ${currentCell} | ${deltaCell} | ${icon} ${comp.verdict} |`;
}

// Build non-gating "Informational" rows. These don't affect the verdict; they
// just keep lower-severity drift (moderate/low advisories, raw duplicated line
// count) visible in the sticky PR comment instead of buried in artifacts.
function buildInfoRows(current, baseline) {
  const rows = [];
  const push = (name, cur, base) => {
    if (isMissing(cur) && isMissing(base)) return;
    rows.push({ name, current: cur, baseline: base });
  };
  push("audit.moderate", current.audit?.moderate, baseline.audit?.moderate);
  push("audit.low", current.audit?.low, baseline.audit?.low);
  push(
    "duplication.duplicatedLines",
    current.duplication?.duplicatedLines,
    baseline.duplication?.duplicatedLines,
  );
  return rows;
}

function formatInfoRow(row) {
  const baselineCell = num(row.baseline);
  const currentCell = num(row.current);
  const deltaCell = delta(row.current, row.baseline);
  return `| ${row.name} | ${baselineCell} | ${currentCell} | ${deltaCell} |`;
}

// 90 days as a soft drift signal — long enough to avoid nagging on healthy
// projects, short enough to flag a baseline that's outlived its representativeness.
const BASELINE_STALE_DAYS = 90;

function baselineAgeDays(baseline) {
  const ts = Date.parse(baseline?.generatedAt ?? "");
  if (!Number.isFinite(ts)) return null;
  return Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
}

function buildReport(comparisons, current, baseline) {
  const hasFail = comparisons.some((c) => c.verdict === "FAIL");
  const passed = comparisons.filter((c) => c.verdict === "PASS").length;
  const skipped = comparisons.filter((c) => c.verdict === "SKIPPED").length;
  const inconclusive = passed === 0 && !hasFail;
  let verdict;
  if (hasFail) {
    verdict = "❌ FAIL";
  } else if (inconclusive) {
    verdict = "⚠️ INCONCLUSIVE";
  } else {
    verdict = "✅ PASS";
  }
  const lines = [];
  lines.push("<!-- quality-gate -->");
  lines.push(`## Quality Gate: ${verdict}`);
  if (skipped > 0) {
    lines.push("");
    lines.push(
      `_${skipped} metric${skipped === 1 ? "" : "s"} SKIPPED — check the workflow logs for collector breakage._`,
    );
  }
  lines.push("");
  lines.push("| Metric | Baseline | Current | Δ | Verdict |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const comp of comparisons) lines.push(formatRow(comp));
  lines.push("");

  const infoRows = buildInfoRows(current, baseline);
  if (infoRows.length > 0) {
    lines.push("### Informational (non-gating)");
    lines.push("| Metric | Baseline | Current | Δ |");
    lines.push("| --- | --- | --- | --- |");
    for (const row of infoRows) lines.push(formatInfoRow(row));
    lines.push("");
  }

  const failures = comparisons.filter((c) => c.verdict === "FAIL");
  if (failures.length > 0) {
    lines.push("### What regressed");
    for (const f of failures) {
      const isCoverage =
        f.name.startsWith("coverage.") || f.name === "duplication.percentage";
      const baseStr = isCoverage ? pct(f.baseline) : num(f.baseline);
      const curStr = isCoverage ? pct(f.current) : num(f.current);
      lines.push(`- **${f.name}**: was ${baseStr}, now ${curStr}`);
    }
    lines.push("");
    lines.push("### How to fix");
    lines.push(
      "- Inspect the failing metric's source data in the workflow artifacts:",
    );
    lines.push("  - `coverage/coverage-summary.json` for coverage regressions");
    lines.push(
      "  - `.gate/lint.json` for new lint diagnostics (biome JSON output)",
    );
    lines.push(
      "  - `.gate/audit.json` for new advisories (`pnpm audit --json`)",
    );
    lines.push(
      "  - `.gate/jscpd/jscpd-report.json` for new duplication clones",
    );
    lines.push(
      "- Refactor only the listed files. Do **not** edit `quality-gate/baseline.json` to bypass the gate — the baseline is a human-approved snapshot, not a free pressure-release valve.",
    );
    lines.push(
      "- If you are an AI agent reading this report: the artifact paths above contain exact file/line references. Read them, fix the underlying issues, then push another commit.",
    );
  } else if (inconclusive) {
    lines.push("### What this means");
    lines.push(
      "No metric produced usable data this run. One or more collectors likely failed (parse error, missing file, schema drift). Check the workflow logs and the uploaded `.gate/` artifacts to diagnose, then re-run the gate.",
    );
  } else {
    lines.push("### Notes");
    lines.push(
      "All gated metrics held or improved. If this PR raised the floor (e.g., added tests), consider running `pnpm gate:update-baseline` after merge to lock the new floor in.",
    );
  }
  const ageDays = baselineAgeDays(baseline);
  if (typeof ageDays === "number" && ageDays > BASELINE_STALE_DAYS) {
    lines.push("");
    lines.push(
      `_Baseline is ${ageDays} days old — consider rebaselining to keep the floor representative._`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

function main() {
  const current = gatherCurrent();

  if (updateBaseline) {
    const missing = Object.entries(current)
      .filter(([, v]) => v === null)
      .map(([k]) => k);
    if (missing.length > 0) {
      console.error(
        `[gate] Refusing to write baseline: collectors produced no usable data for: ${missing.join(", ")}.`,
      );
      console.error(
        "[gate] The baseline is a human-approved floor; locking in null/zero values silently is exactly the regression the gate exists to prevent.",
      );
      process.exit(1);
    }
    ensureDir(PATHS.baseline);
    const payload = {
      generatedAt: new Date().toISOString(),
      ...current,
    };
    atomicWriteFileSync(
      PATHS.baseline,
      `${JSON.stringify(payload, null, 2)}\n`,
    );
    console.log(`[gate] Baseline written to ${PATHS.baseline}`);
    return;
  }

  const baseline = readJsonOrNull(PATHS.baseline);
  if (!baseline) {
    console.error(
      "[gate] No baseline found. Run `pnpm gate:update-baseline` to seed one from the current checkout.",
    );
    process.exit(2);
  }

  const comparisons = buildComparisons(current, baseline);
  const report = buildReport(comparisons, current, baseline);

  ensureDir(PATHS.metricsSummary);
  atomicWriteFileSync(
    PATHS.metricsSummary,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), comparisons, current, baseline }, null, 2)}\n`,
  );
  ensureDir(PATHS.report);
  atomicWriteFileSync(PATHS.report, report);

  console.log(report);

  const hasFail = comparisons.some((c) => c.verdict === "FAIL");
  const passed = comparisons.filter((c) => c.verdict === "PASS").length;
  if (hasFail) process.exit(1);
  if (passed === 0) process.exit(3);
  process.exit(0);
}

main();
