import { describe, expect, it } from "vitest";
import { toDetailEvidence } from "./case-simulation-cockpit-adapters";
import type { SimulateEvidenceItem } from "../hooks/use-simulate-case";

function realEvidenceItem(overrides: Partial<SimulateEvidenceItem> = {}): SimulateEvidenceItem {
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
    ...overrides,
  };
}

describe("toDetailEvidence -- reading a real simulate response's own flat capability reference without throwing (criterion 2)", () => {
  it("does not throw for a well-formed evidence item carrying only the flat capability_name/capability_version fields a real response actually sends", () => {
    const evidence: readonly SimulateEvidenceItem[] = [realEvidenceItem()];

    expect(() => toDetailEvidence(evidence)).not.toThrow();
  });

  it("carries the real response's own capability_name and capability_version through, unchanged, for a well-formed evidence item", () => {
    const evidence: readonly SimulateEvidenceItem[] = [
      realEvidenceItem({
        capability_name: "perfil-mobile-tecnico-reader",
        capability_version: "1.0.0",
      }),
    ];

    const [item] = toDetailEvidence(evidence);

    expect(item?.capabilityName).toBe("perfil-mobile-tecnico-reader");
    expect(item?.capabilityVersion).toBe("1.0.0");
  });
});

describe("toDetailEvidence -- normalizing the wire's snake_case capability reference into the Detail region's own camelCase fields (this task's own recorded inference)", () => {
  it("maps capability_name/capability_version to capabilityName/capabilityVersion, and origin to connector, rather than keeping the wire's own snake_case names or nesting them under a capability object", () => {
    const evidence: readonly SimulateEvidenceItem[] = [
      realEvidenceItem({
        capability_name: "lookup-account",
        capability_version: "2.3.4",
        origin: "billing-connector",
      }),
    ];

    const [item] = toDetailEvidence(evidence);

    expect(item).toMatchObject({
      capabilityName: "lookup-account",
      capabilityVersion: "2.3.4",
      connector: "billing-connector",
    });
    expect(item).not.toHaveProperty("capability_name");
    expect(item).not.toHaveProperty("capability_version");
    expect(item).not.toHaveProperty("capability");
  });
});
