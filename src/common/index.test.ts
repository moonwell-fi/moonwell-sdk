import { describe, expect, test } from "vitest";
import {
  applyGranularity,
  calculateTimeRange,
  toApiGranularity,
} from "./index.js";

// ---------------------------------------------------------------------------
// applyGranularity — pure unit tests
// ---------------------------------------------------------------------------

describe("applyGranularity", () => {
  function makeSnapshots(count: number): { timestamp: number }[] {
    return Array.from({ length: count }, (_, i) => ({ timestamp: i * 86400 }));
  }

  test("returns all items for 6h granularity (step=1)", () => {
    const snapshots = makeSnapshots(10);
    expect(applyGranularity(snapshots, "6h")).toHaveLength(10);
  });

  test("returns all items for 1d granularity (step=1)", () => {
    const snapshots = makeSnapshots(10);
    expect(applyGranularity(snapshots, "1d")).toHaveLength(10);
  });

  test("returns empty array for empty input", () => {
    expect(applyGranularity([], "7d")).toHaveLength(0);
  });

  test("keeps indices 0, 7, 14, 21, 28 for 7d granularity over 30 snapshots", () => {
    const snapshots = makeSnapshots(30);
    const result = applyGranularity(snapshots, "7d");
    expect(result).toHaveLength(5);
    expect(result[0].timestamp).toBe(snapshots[0].timestamp);
    expect(result[1].timestamp).toBe(snapshots[7].timestamp);
    expect(result[2].timestamp).toBe(snapshots[14].timestamp);
    expect(result[3].timestamp).toBe(snapshots[21].timestamp);
    expect(result[4].timestamp).toBe(snapshots[28].timestamp);
  });

  test("keeps indices 0, 14, 28 for 14d granularity over 30 snapshots", () => {
    const snapshots = makeSnapshots(30);
    const result = applyGranularity(snapshots, "14d");
    expect(result).toHaveLength(3);
    expect(result[0].timestamp).toBe(snapshots[0].timestamp);
    expect(result[1].timestamp).toBe(snapshots[14].timestamp);
    expect(result[2].timestamp).toBe(snapshots[28].timestamp);
  });

  test("keeps indices 0, 30, 60 for 30d granularity over 61 snapshots", () => {
    const snapshots = makeSnapshots(61);
    const result = applyGranularity(snapshots, "30d");
    expect(result).toHaveLength(3);
    expect(result[0].timestamp).toBe(snapshots[0].timestamp);
    expect(result[1].timestamp).toBe(snapshots[30].timestamp);
    expect(result[2].timestamp).toBe(snapshots[60].timestamp);
  });

  test("always retains the oldest data point (index 0) for any granularity", () => {
    const snapshots = makeSnapshots(100);
    for (const granularity of ["6h", "1d", "7d", "14d", "30d"] as const) {
      const result = applyGranularity(snapshots, granularity);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].timestamp).toBe(snapshots[0].timestamp);
    }
  });

  test("single item array returns that item regardless of granularity", () => {
    const snapshots = [{ timestamp: 12345 }];
    for (const granularity of ["7d", "14d", "30d"] as const) {
      expect(applyGranularity(snapshots, granularity)).toHaveLength(1);
    }
  });

  test("7d granularity returns fewer points than 1d for the same data", () => {
    const snapshots = makeSnapshots(100);
    const daily = applyGranularity(snapshots, "1d");
    const weekly = applyGranularity(snapshots, "7d");
    expect(weekly.length).toBeLessThan(daily.length);
  });
});

// ---------------------------------------------------------------------------
// toApiGranularity — pure unit tests
// ---------------------------------------------------------------------------

describe("toApiGranularity", () => {
  test('maps "6h" → "6h" (API-native)', () => {
    expect(toApiGranularity("6h")).toBe("6h");
  });

  test('maps "1d" → "1d" (API-native)', () => {
    expect(toApiGranularity("1d")).toBe("1d");
  });

  test('maps "7d" → "1d" (client-side thinning)', () => {
    expect(toApiGranularity("7d")).toBe("1d");
  });

  test('maps "14d" → "1d" (client-side thinning)', () => {
    expect(toApiGranularity("14d")).toBe("1d");
  });

  test('maps "30d" → "1d" (client-side thinning)', () => {
    expect(toApiGranularity("30d")).toBe("1d");
  });
});

// ---------------------------------------------------------------------------
// calculateTimeRange — pure unit tests
// ---------------------------------------------------------------------------

describe("calculateTimeRange", () => {
  test('period "1M" → granularity "6h"', () => {
    const { granularity } = calculateTimeRange("1M");
    expect(granularity).toBe("6h");
  });

  test('period "3M" → granularity "1d"', () => {
    const { granularity } = calculateTimeRange("3M");
    expect(granularity).toBe("1d");
  });

  test('period "1Y" → granularity "7d"', () => {
    const { granularity } = calculateTimeRange("1Y");
    expect(granularity).toBe("7d");
  });

  test('period "ALL" → granularity "14d"', () => {
    const { granularity } = calculateTimeRange("ALL");
    expect(granularity).toBe("14d");
  });

  test('default (no period) → granularity "1d"', () => {
    const { granularity } = calculateTimeRange(undefined);
    expect(granularity).toBe("1d");
  });

  test('custom startTime → granularity "1d"', () => {
    const now = Math.floor(Date.now() / 1000);
    const { granularity } = calculateTimeRange(undefined, now - 86400, now);
    expect(granularity).toBe("1d");
  });

  test("startTime is before endTime for all periods", () => {
    for (const period of ["1M", "3M", "1Y", "ALL"] as const) {
      const { startTime, endTime } = calculateTimeRange(period);
      expect(startTime).toBeLessThan(endTime);
    }
  });

  test('period "1M" startTime is ~31 days before endTime', () => {
    const { startTime, endTime } = calculateTimeRange("1M");
    const diffDays = (endTime - startTime) / 86400;
    expect(diffDays).toBeGreaterThanOrEqual(30);
    expect(diffDays).toBeLessThanOrEqual(32);
  });

  test('period "3M" startTime is ~91 days before endTime', () => {
    const { startTime, endTime } = calculateTimeRange("3M");
    const diffDays = (endTime - startTime) / 86400;
    expect(diffDays).toBeGreaterThanOrEqual(90);
    expect(diffDays).toBeLessThanOrEqual(93);
  });

  test('period "1Y" startTime is ~366 days before endTime', () => {
    const { startTime, endTime } = calculateTimeRange("1Y");
    const diffDays = (endTime - startTime) / 86400;
    expect(diffDays).toBeGreaterThanOrEqual(365);
    expect(diffDays).toBeLessThanOrEqual(368);
  });

  test('period "ALL" startTime is ~2 years before endTime', () => {
    const { startTime, endTime } = calculateTimeRange("ALL");
    const diffDays = (endTime - startTime) / 86400;
    expect(diffDays).toBeGreaterThanOrEqual(729);
    expect(diffDays).toBeLessThanOrEqual(732);
  });

  test("custom endTime is respected", () => {
    const customEnd = 1700000000;
    const { endTime } = calculateTimeRange(
      undefined,
      customEnd - 86400,
      customEnd,
    );
    expect(endTime).toBe(customEnd);
  });

  test("custom startTime is respected", () => {
    const now = Math.floor(Date.now() / 1000);
    const customStart = now - 7 * 86400;
    const { startTime } = calculateTimeRange(undefined, customStart, now);
    expect(startTime).toBe(customStart);
  });
});
