import { describe, expect, it } from "vitest";
import type { SimulationEvidenceItem } from "./case-simulation-detail-types";

function baseDetailEvidenceItem(
  overrides: Partial<SimulationEvidenceItem> = {},
): SimulationEvidenceItem {
  return {
    concept: "Balance",
    result: "ok",
    elapsedMs: 120,
    observation: "{}",
    inputs: "{}",
    observedAt: "2026-01-01T00:00:00.000Z",
    ttl: 3600,
    capabilityName: "translate-text",
    capabilityVersion: "1.0.0",
    connector: "deepl-connector",
    capabilityPayloadNotes: "",
    fields: [],
    conceptDescription: "",
    ...overrides,
  };
}

describe("SimulationEvidenceItem -- fields and conceptDescription are required members (evidence-semantics-always-present criterion 3)", () => {
  it("refuses an evidence item literal that assigns undefined to fields or conceptDescription", () => {
    const complete = baseDetailEvidenceItem({
      fields: [{ name: "status" }],
      conceptDescription: "the account's status",
    });

    // @ts-expect-error -- fields is required, not optional (evidence-semantics-always-present criterion 3).
    const missingFields: SimulationEvidenceItem = { ...complete, fields: undefined };
    void missingFields;

    // @ts-expect-error -- conceptDescription is required, not optional (evidence-semantics-always-present criterion 3).
    const missingConceptDescription: SimulationEvidenceItem = { ...complete, conceptDescription: undefined };
    void missingConceptDescription;

    expect(complete.fields).toEqual([{ name: "status" }]);
    expect(complete.conceptDescription).toBe("the account's status");
  });
});
