import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseSimulationCaseResultEvidenceTab } from "./case-simulation-case-result-evidence-tab";
import type { SimulationEvidenceItem } from "./case-simulation-detail-types";

function testItem(overrides: Partial<SimulationEvidenceItem> = {}): SimulationEvidenceItem {
  return {
    concept: "Balance",
    result: "ok",
    elapsedMs: 120,
    observation: JSON.stringify({ balance: 42 }),
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

describe("CaseSimulationCaseResultEvidenceTab -- one entry for each evidence item the run returned (criterion 1)", () => {
  it("renders one entry for each item in the evidence prop, one per concept the run collected", () => {
    render(
      createElement(CaseSimulationCaseResultEvidenceTab, {
        evidence: [
          testItem({ concept: "Balance" }),
          testItem({ concept: "AccountStatus", connector: "core-banking-connector" }),
          testItem({ concept: "OverdueDays", connector: "core-banking-connector" }),
        ],
      }),
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Balance")).toBeTruthy();
    expect(screen.getByText("AccountStatus")).toBeTruthy();
    expect(screen.getByText("OverdueDays")).toBeTruthy();
  });

  it("renders no entry and an explicit empty state when the run returned no evidence", () => {
    render(createElement(CaseSimulationCaseResultEvidenceTab, { evidence: [] }));

    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(screen.getByText("No evidence collected for this run.")).toBeTruthy();
  });
});
