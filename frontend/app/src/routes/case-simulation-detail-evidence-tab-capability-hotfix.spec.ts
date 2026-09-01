import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseSimulationDetailEvidenceTab } from "./case-simulation-detail-evidence-tab";
import type { SimulationEvidenceItem, SimulationJudgmentCall } from "./case-simulation-detail-types";

const NOT_CALLED: SimulationJudgmentCall = { called: false };

function realDetailEvidenceItem(overrides: Partial<SimulationEvidenceItem> = {}): SimulationEvidenceItem {
  return {
    concept: "perfil-mobile-tecnico",
    result: "ok",
    elapsedMs: 340,
    observation: '{"status":"active"}',
    capabilityName: "perfil-mobile-tecnico-reader",
    capabilityVersion: "1.0.0",
    connector: "mobile-tecnico-connector",
    ...overrides,
  };
}

describe("CaseSimulationDetailEvidenceTab -- the capability/connector line reads capabilityName/capabilityVersion/connector as flat fields (criterion 3)", () => {
  it("renders the capability name, version and connector straight off the evidence item's own flat fields, for a well-formed item with no nested capability object", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["perfil-mobile-tecnico"],
        evidence: [realDetailEvidenceItem()],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(
      screen.getByText("perfil-mobile-tecnico-reader 1.0.0 → mobile-tecnico-connector"),
    ).toBeTruthy();
  });

  it("does not throw for a well-formed evidence item, reproducing the Detail panel's own real crash scenario and showing it no longer occurs", () => {
    expect(() =>
      render(
        createElement(CaseSimulationDetailEvidenceTab, {
          collects: ["perfil-mobile-tecnico"],
          evidence: [realDetailEvidenceItem()],
          judgmentCall: NOT_CALLED,
        }),
      ),
    ).not.toThrow();
  });
});
