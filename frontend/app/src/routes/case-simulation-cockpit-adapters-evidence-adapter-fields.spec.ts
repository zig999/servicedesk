import { describe, expect, it } from "vitest";
import { toDetailEvidence } from "./case-simulation-cockpit-adapters";
import type { SimulateEvidenceItem } from "../hooks/use-simulate-case";

function baseEvidenceItem(overrides: Partial<SimulateEvidenceItem> = {}): SimulateEvidenceItem {
  return {
    concept: "billing-history",
    inputs: '{"account_id":"acc-42"}',
    observation: "the account shows one authorized charge",
    observed_at: "2026-08-01T00:00:00.000Z",
    ttl: 900,
    origin: "billing-connector",
    result: "ok",
    capability_name: "fetch-billing-account",
    capability_version: "1",
    elapsed_ms: 120,
    capability_payload_notes: "Field 3 reflects the account's current dispute flag.",
    ...overrides,
  };
}

describe("toDetailEvidence -- carries inputs, observedAt, ttl and capabilityPayloadNotes through unchanged, from the argument alone (criteria 2 and 3)", () => {
  it("returns each of the four values exactly as the response item carried them", () => {
    const evidence: readonly SimulateEvidenceItem[] = [baseEvidenceItem()];

    const [item] = toDetailEvidence(evidence);

    expect(item?.inputs).toBe('{"account_id":"acc-42"}');
    expect(item?.observedAt).toBe("2026-08-01T00:00:00.000Z");
    expect(item?.ttl).toBe(900);
    expect(item?.capabilityPayloadNotes).toBe("Field 3 reflects the account's current dispute flag.");
  });
});

describe("toDetailEvidence -- an empty capability payload notes snapshot stays empty (criterion 4)", () => {
  it("carries an empty capability_payload_notes through as an empty string, never a substituted note", () => {
    const evidence: readonly SimulateEvidenceItem[] = [
      baseEvidenceItem({ capability_payload_notes: "" }),
    ];

    const [item] = toDetailEvidence(evidence);

    expect(item?.capabilityPayloadNotes).toBe("");
  });
});

describe("toDetailEvidence -- an item collected with no inputs keeps its recorded empty object (criterion 5)", () => {
  it("carries the response's own `{}` through unchanged, never an invented placeholder", () => {
    const evidence: readonly SimulateEvidenceItem[] = [baseEvidenceItem({ inputs: "{}" })];

    const [item] = toDetailEvidence(evidence);

    expect(item?.inputs).toBe("{}");
  });
});
