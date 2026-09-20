import { describe, expect, it } from "vitest";
import { toDetailEvidence } from "./case-simulation-cockpit-adapters";
import type { SimulateEvidenceItem, SimulateFieldSemantics } from "../hooks/use-simulate-case";
import type { Evidence, FieldSemantics } from "../hooks/use-simulate-hypothesis";

function baseEvidenceItem(overrides: Partial<SimulateEvidenceItem> = {}): SimulateEvidenceItem {
  return {
    concept: "perfil-mobile-tecnico",
    inputs: "{}",
    observation: '{"status":"active"}',
    observed_at: "2026-08-28T00:00:00.000Z",
    ttl: 3600,
    origin: "mobile-tecnico-connector",
    result: "ok",
    capability_name: "perfil-mobile-tecnico-reader",
    capability_version: "1.0.0",
    elapsed_ms: 340,
    capability_payload_notes: "",
    fields: [],
    concept_description: "",
    ...overrides,
  };
}

const SAMPLE_FIELDS: readonly SimulateFieldSemantics[] = [
  { name: "status", type: "string", description: "1=ativo, 2=suspenso" },
  { name: "dias_em_atraso" },
];

describe("SimulateEvidenceItem -- fields and concept_description are required, honest-empty wire fields (criterion 1)", () => {
  it("constructs a bare item with the honest-empty value for both, never undefined", () => {
    const item: SimulateEvidenceItem = baseEvidenceItem();

    expect(item.fields).toEqual([]);
    expect(item.concept_description).toBe("");
  });

  it("constructs with both fields present, proving the declared shape accepts them", () => {
    const item: SimulateEvidenceItem = baseEvidenceItem({
      fields: SAMPLE_FIELDS,
      concept_description: "a situação cadastral do contrato",
    });

    expect(item.fields).toEqual(SAMPLE_FIELDS);
    expect(item.concept_description).toBe("a situação cadastral do contrato");
  });
});

describe("Evidence (use-simulate-hypothesis) -- fields and concept_description are required, honest-empty wire fields (criterion 2)", () => {
  it("constructs a bare item with the honest-empty value for both, never undefined", () => {
    const item: Evidence = {
      concept: "perfil-mobile-tecnico",
      inputs: "{}",
      observation: '{"status":"active"}',
      observed_at: "2026-08-28T00:00:00.000Z",
      ttl: 3600,
      origin: "mobile-tecnico-connector",
      result: "ok",
      capability_name: "perfil-mobile-tecnico-reader",
      capability_version: "1.0.0",
      elapsed_ms: 340,
      capability_payload_notes: "",
      fields: [],
      concept_description: "",
    };

    expect(item.fields).toEqual([]);
    expect(item.concept_description).toBe("");
  });

  it("constructs with both fields present, using its own independently-declared FieldSemantics", () => {
    const fields: readonly FieldSemantics[] = [{ name: "status" }];
    const item: Evidence = {
      concept: "perfil-mobile-tecnico",
      inputs: "{}",
      observation: '{"status":"active"}',
      observed_at: "2026-08-28T00:00:00.000Z",
      ttl: 3600,
      origin: "mobile-tecnico-connector",
      result: "ok",
      capability_name: "perfil-mobile-tecnico-reader",
      capability_version: "1.0.0",
      elapsed_ms: 340,
      capability_payload_notes: "",
      fields,
      concept_description: "a situação cadastral do contrato",
    };

    expect(item.fields).toEqual(fields);
  });
});

describe("toDetailEvidence -- carries fields/concept_description through as fields/conceptDescription (criterion 3)", () => {
  it("carries a present, non-empty snapshot through unchanged", () => {
    const evidence: readonly SimulateEvidenceItem[] = [
      baseEvidenceItem({
        fields: SAMPLE_FIELDS,
        concept_description: "a situação cadastral do contrato",
      }),
    ];

    const [item] = toDetailEvidence(evidence);

    expect(item?.fields).toEqual(SAMPLE_FIELDS);
    expect(item?.conceptDescription).toBe("a situação cadastral do contrato");
  });

  it("carries a present but empty snapshot through unchanged, never inventing a value", () => {
    const evidence: readonly SimulateEvidenceItem[] = [
      baseEvidenceItem({ fields: [], concept_description: "" }),
    ];

    const [item] = toDetailEvidence(evidence);

    expect(item?.fields).toEqual([]);
    expect(item?.conceptDescription).toBe("");
  });

  it("carries a bare item's own honest-empty fields and concept_description through unchanged, asserting undefined nowhere", () => {
    const evidence: readonly SimulateEvidenceItem[] = [baseEvidenceItem()];

    const [item] = toDetailEvidence(evidence);

    expect(item?.fields).toEqual([]);
    expect(item?.conceptDescription).toBe("");
  });
});
