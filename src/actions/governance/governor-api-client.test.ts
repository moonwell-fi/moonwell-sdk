import { describe, expect, test } from "vitest";
import { buildProposalKey } from "./governor-api-client.js";

describe("buildProposalKey", () => {
  test("pads single-digit proposalId to 10 digits for Ethereum", () => {
    expect(buildProposalKey(1, 7)).toBe("1-0000000007");
  });

  test("pads single-digit proposalId to 10 digits for Moonbeam historical", () => {
    expect(buildProposalKey(1284, 7)).toBe("1284-0000000007");
  });

  test("keeps full width when proposalId is already 10 digits", () => {
    expect(buildProposalKey(1, 1234567890)).toBe("1-1234567890");
  });

  test("pads multi-digit proposalIds correctly", () => {
    expect(buildProposalKey(1, 123)).toBe("1-0000000123");
    expect(buildProposalKey(1284, 99)).toBe("1284-0000000099");
  });

  test("accepts proposalId as a string", () => {
    expect(buildProposalKey(1, "7")).toBe("1-0000000007");
  });
});
