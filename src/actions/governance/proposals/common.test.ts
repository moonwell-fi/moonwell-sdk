import { describe, expect, test } from "vitest";
import {
  WORMHOLE_CONTRACT,
  isMultichainAware,
  isMultichainProposal,
} from "./common.js";

const LOCAL_TARGET = "0xed301cd3eb27217bdb05c4e9b820a8a3c8b665f9";

describe("isMultichainProposal", () => {
  test("matches when targets include the Wormhole bridge", () => {
    expect(isMultichainProposal([WORMHOLE_CONTRACT])).toBe(true);
  });

  test("matches when Wormhole address is uppercase", () => {
    expect(isMultichainProposal([WORMHOLE_CONTRACT.toUpperCase()])).toBe(true);
  });

  test("returns false when targets don't include Wormhole", () => {
    expect(isMultichainProposal([LOCAL_TARGET])).toBe(false);
  });

  test("returns false for undefined or empty targets", () => {
    expect(isMultichainProposal(undefined)).toBe(false);
    expect(isMultichainProposal([])).toBe(false);
  });
});

describe("isMultichainAware", () => {
  test("returns true when targets include Wormhole even if proposalId is below cutoff", () => {
    expect(
      isMultichainAware({ targets: [WORMHOLE_CONTRACT], proposalId: 10 }, 100),
    ).toBe(true);
  });

  test("returns true when proposalId is past the legacy Artemis cutoff", () => {
    expect(
      isMultichainAware({ targets: [LOCAL_TARGET], proposalId: 93 }, 86),
    ).toBe(true);
  });

  test("returns false when proposalId is at or below the cutoff and no Wormhole target", () => {
    expect(
      isMultichainAware({ targets: [LOCAL_TARGET], proposalId: 86 }, 86),
    ).toBe(false);
    expect(
      isMultichainAware({ targets: [LOCAL_TARGET], proposalId: 50 }, 86),
    ).toBe(false);
  });

  test("falls back to targets-only when legacyArtemisMaxId is 0 (proposalCount RPC failed)", () => {
    expect(
      isMultichainAware({ targets: [WORMHOLE_CONTRACT], proposalId: 999 }, 0),
    ).toBe(true);
    expect(
      isMultichainAware({ targets: [LOCAL_TARGET], proposalId: 999 }, 0),
    ).toBe(false);
  });

  test("returns false for an unknown proposal (no targets, no past-cutoff id)", () => {
    expect(isMultichainAware({ proposalId: 1 }, 86)).toBe(false);
  });
});
