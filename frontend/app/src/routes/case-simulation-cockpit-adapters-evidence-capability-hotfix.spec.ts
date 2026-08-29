import { describe, expect, it } from "vitest";
import { toDetailEvidence } from "./case-simulation-cockpit-adapters";
import type { SimulateEvidenceItem } from "../hooks/use-simulate-case";

// task/detail-evidence-capability-hotfix/flatten-detail-evidence-capability-reference's own
// criteria 2 and 4, and its own recorded inference on the Detail region's camelCase naming --
// proven directly against toDetailEvidence (case-simulation-cockpit-adapters.ts), the exact
// function the reproduction's own stack trace names as the one that threw. Split into its own
// file (mirroring case-simulation-cockpit-adapters-stale.spec.ts's own established split
// convention for this unit) rather than folded into case-simulation-cockpit-adapters.spec.ts,
// since that file's own existing "toDetailEvidence" describe block is a fixed pre-existing test
// (this corrective task's own authorized fixture-correction exception) rather than new proof
// written for this task.

/** The exact evidence item shape a real POST /v1/simulate response sends (this task's own
 * reproduction: a captured response body carrying "capability_name":"perfil-mobile-tecnico-reader",
 * "capability_version":"1.0.0" and no `capability` object at all) -- constructing this as a
 * SimulateEvidenceItem literal is itself part of the proof: it only compiles because the type
 * now declares these two fields flat (criterion 4). */
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
