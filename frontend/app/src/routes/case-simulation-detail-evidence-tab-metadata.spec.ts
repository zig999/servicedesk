import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseSimulationDetailEvidenceTab } from "./case-simulation-detail-evidence-tab";
import { testEvidenceItem } from "./case-simulation-detail-panel.test-support";
import type { SimulationJudgmentCall } from "./case-simulation-detail-types";

const NOT_CALLED: SimulationJudgmentCall = { called: false };

describe("CaseSimulationDetailEvidenceTab -- observed_at is shown as the raw UTC instant the item carries (criterion 1)", () => {
  it("renders the item's own observed_at string verbatim, suffixed UTC, with no local-zone or Date-object reformatting", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [
          testEvidenceItem({ concept: "Balance", observedAt: "2026-03-15T08:45:12.345Z" }),
        ],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.getByText("2026-03-15T08:45:12.345Z UTC")).toBeTruthy();
  });
});

describe("CaseSimulationDetailEvidenceTab -- ttl is shown as a bare count of seconds read off the item (criterion 2)", () => {
  it("renders the item's own ttl number, suffixed with seconds, with no recomputation or unit conversion", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [testEvidenceItem({ concept: "Balance", ttl: 7421 })],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.getByText("ttl 7421s")).toBeTruthy();
  });
});

describe("CaseSimulationDetailEvidenceTab -- inputs are shown for the collected item (criterion 3)", () => {
  it("shows the inputs the collection was issued with, pretty-printed inside a collapsible 'Inputs' block", () => {
    const inputs = JSON.stringify({ accountId: "12345", includeHistory: true });
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [testEvidenceItem({ concept: "Balance", inputs })],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.getByText("Inputs")).toBeTruthy();
    expect(
      screen.getByText(JSON.stringify(JSON.parse(inputs), null, 2), {
        normalizer: (text) => text,
      }),
    ).toBeTruthy();
  });
});

describe("CaseSimulationDetailEvidenceTab -- capability payload notes are shown exactly as snapshotted (criterion 4)", () => {
  it("renders the item's own capability_payload_notes text verbatim", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [
          testEvidenceItem({
            concept: "Balance",
            capabilityPayloadNotes: "Connector normalizes null balances to zero before returning them.",
          }),
        ],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(
      screen.getByText("Connector normalizes null balances to zero before returning them."),
    ).toBeTruthy();
  });
});

describe("CaseSimulationDetailEvidenceTab -- empty capability payload notes render as no notes, never a substitute (criterion 5)", () => {
  it("renders no notes text and no invented placeholder when the item's own capability_payload_notes is empty", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [testEvidenceItem({ concept: "Balance", capabilityPayloadNotes: "" })],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.getByText("Balance")).toBeTruthy();
    expect(screen.queryByText(/^No .+ recorded for this/)).toBeNull();
  });
});
