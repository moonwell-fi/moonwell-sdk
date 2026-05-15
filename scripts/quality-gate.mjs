#!/usr/bin/env node
// Quality Gate engine: compares collector outputs against a committed baseline
// and emits a markdown report + JSON summary. Exit 0 on PASS, 1 on FAIL.
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

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
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
  // Biome JSON output: { diagnostics: [{ severity: "error"|"warning"|... }, ...] }
  // Fall back to counting top-level summary if present.
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
  if (raw.summary) {
    return {
      errors: raw.summary.errors ?? 0,
      warnings: raw.summary.warnings ?? 0,
    };
  }
  return { errors: 0, warnings: 0 };
}

function collectAudit(raw) {
  if (!raw) return null;
  const v = raw.metadata?.vulnerabilities ?? raw.vulnerabilities ?? {};
  return {
    critical: v.critical ?? 0,
    high: v.high ?? 0,
    moderate: v.moderate ?? 0,
    low: v.low ?? 0,
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

// Compare with verdict: PASS, FAIL, SKIPPED
function compareMetric(name, current, baseline, comparator) {
  if (current === null || current === undefined) {
    return {
      name,
      current,
      baseline,
      verdict: "SKIPPED",
      reason: "no current data",
    };
  }
  if (baseline === null || baseline === undefined) {
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

  // Coverage: current >= baseline - tolerance
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

  // Lint: current <= baseline
  const leGate = (cur, base) => cur <= base;
  comparisons.push(
    compareMetric("lint.errors", c.lint?.errors, b.lint?.errors, leGate),
  );
  comparisons.push(
    compareMetric("lint.warnings", c.lint?.warnings, b.lint?.warnings, leGate),
  );

  // Audit: ratchet — current count must not exceed the baseline. New
  // advisories fail; pre-existing ones are tolerated until rebaselined.
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

  // Duplication: current <= baseline + tolerance (for %), exact for clones
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

function buildReport(comparisons, current, baseline) {
  const hasFail = comparisons.some((c) => c.verdict === "FAIL");
  const verdict = hasFail ? "❌ FAIL" : "✅ PASS";
  const lines = [];
  lines.push("<!-- quality-gate -->");
  lines.push(`## Quality Gate: ${verdict}`);
  lines.push("");
  lines.push("| Metric | Baseline | Current | Δ | Verdict |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const comp of comparisons) lines.push(formatRow(comp));
  lines.push("");

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
      "  - `.gate/audit.json` for new advisories (`npm audit --json`)",
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
  } else {
    lines.push("### Notes");
    lines.push(
      "All gated metrics held or improved. If this PR raised the floor (e.g., added tests), consider running `npm run gate:update-baseline` after merge to lock the new floor in.",
    );
  }
  lines.push("");
  return lines.join("\n");
}

function main() {
  const current = gatherCurrent();

  if (updateBaseline) {
    ensureDir(PATHS.baseline);
    const payload = {
      generatedAt: new Date().toISOString(),
      ...current,
    };
    writeFileSync(PATHS.baseline, `${JSON.stringify(payload, null, 2)}\n`);
    console.log(`[gate] Baseline written to ${PATHS.baseline}`);
    return;
  }

  const baseline = readJsonOrNull(PATHS.baseline);
  if (!baseline) {
    console.error(
      "[gate] No baseline found. Run `npm run gate:update-baseline` to seed one from the current checkout.",
    );
    process.exit(2);
  }

  const comparisons = buildComparisons(current, baseline);
  const report = buildReport(comparisons, current, baseline);

  ensureDir(PATHS.metricsSummary);
  writeFileSync(
    PATHS.metricsSummary,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), comparisons, current, baseline }, null, 2)}\n`,
  );
  ensureDir(PATHS.report);
  writeFileSync(PATHS.report, report);

  console.log(report);

  const hasFail = comparisons.some((c) => c.verdict === "FAIL");
  process.exit(hasFail ? 1 : 0);
}

main();
