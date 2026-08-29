import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseSimulationDetailEvidenceTab } from "./case-simulation-detail-evidence-tab";
import { testEvidenceItem } from "./case-simulation-detail-panel.test-support";
import type { SimulationJudgmentCall } from "./case-simulation-detail-types";

// Proof for task/simulation-evidence-snapshot/evidence-tab-snapshot-rendering's own criteria
// 1-6, proven directly against CaseSimulationDetailEvidenceTab, mirroring
// case-simulation-detail-evidence-tab.spec.ts's own established render+assert pattern and
// shared testEvidenceItem() fixture. Split into its own sibling file per this project's own
// max-lines rule (MNT-01). Criterion 7 (no glossary/capability-registry read to enrich the
// snapshot) is not independently tested here: this component issues no fetch or hook call of
// any kind, reading only the `item` prop it already received, so no test setup could observe a
// request that has nowhere to originate from -- verified by reading the diff instead.

const NOT_CALLED: SimulationJudgmentCall = { called: false };

describe("CaseSimulationDetailEvidenceTab -- shows a present concept_description (criterion 1)", () => {
  it("renders the item's own concept_description alongside it", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [
          testEvidenceItem({
            concept: "Balance",
            conceptDescription: "a situação cadastral e financeira do contrato",
          }),
        ],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.getByText("a situação cadastral e financeira do contrato")).toBeTruthy();
  });
});

describe("CaseSimulationDetailEvidenceTab -- shows each snapshotted field's name, type and description (criteria 2, 3)", () => {
  it("renders a field's name, type and description together when the snapshot states all three", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [
          testEvidenceItem({
            concept: "Balance",
            fields: [{ name: "status", type: "string", description: "1=ativo, 2=suspenso" }],
          }),
        ],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.getByText("status")).toBeTruthy();
    expect(screen.getByText("(string)")).toBeTruthy();
    expect(screen.getByText("— 1=ativo, 2=suspenso")).toBeTruthy();
  });

  it("renders only the field's own name when the snapshot states neither type nor description, inventing neither", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [
          testEvidenceItem({
            concept: "Balance",
            fields: [{ name: "dias_em_atraso" }],
          }),
        ],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.getByText("dias_em_atraso")).toBeTruthy();
    expect(screen.queryByText(/^\(/)).toBeNull();
    expect(screen.queryByText(/^—/)).toBeNull();
  });

  it("renders a field's own type without inventing a description when only type is stated", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [
          testEvidenceItem({
            concept: "Balance",
            fields: [{ name: "amount", type: "number" }],
          }),
        ],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.getByText("(number)")).toBeTruthy();
    expect(screen.queryByText(/^—/)).toBeNull();
  });
});

describe("CaseSimulationDetailEvidenceTab -- an empty concept_description renders a stated absence, never invented text (criterion 4)", () => {
  it("renders the stated-absence sentence when concept_description is an empty string", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [testEvidenceItem({ concept: "Balance", conceptDescription: "" })],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.getByText("No description recorded for this concept.")).toBeTruthy();
  });
});

describe("CaseSimulationDetailEvidenceTab -- an empty fields snapshot renders a stated absence, and the item still renders (criterion 5)", () => {
  it("renders the stated-absence sentence for an empty fields array, alongside the item's own other content", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [testEvidenceItem({ concept: "Balance", fields: [] })],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.getByText("No field semantics recorded for this observation.")).toBeTruthy();
    expect(screen.getByText("Balance")).toBeTruthy();
    expect(screen.getByText("Observation")).toBeTruthy();
  });
});

describe("CaseSimulationDetailEvidenceTab -- a legacy item carrying no snapshot at all renders exactly as before, without error (criterion 6)", () => {
  it("renders neither a concept_description line nor a field-semantics line when both are absent", () => {
    render(
      createElement(CaseSimulationDetailEvidenceTab, {
        collects: ["Balance"],
        evidence: [testEvidenceItem({ concept: "Balance" })],
        judgmentCall: NOT_CALLED,
      }),
    );

    expect(screen.queryByText("No description recorded for this concept.")).toBeNull();
    expect(screen.queryByText("No field semantics recorded for this observation.")).toBeNull();
    expect(screen.getByText("Balance")).toBeTruthy();
  });
});
