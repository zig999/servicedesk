import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CaseSimulationDetailPanel } from "./case-simulation-detail-panel";
import {
  testCalledJudgment,
  testEvaluation,
  testHypothesisRevision,
  testPanelProps,
} from "./case-simulation-detail-panel.test-support";
import type { CaseSimulationDetailPanelProps } from "./case-simulation-detail-types";

function mount(overrides: Partial<CaseSimulationDetailPanelProps> = {}): void {
  render(createElement(CaseSimulationDetailPanel, testPanelProps(overrides)));
}

describe("CaseSimulationDetailPanel -- the selected hypothesis's own verdict and citations (criterion 1)", () => {
  it("shows the hypothesis's own verdict word", () => {
    mount({ evaluation: testEvaluation({ verdict: "refuted" }) });

    expect(screen.getByText("refuted")).toBeTruthy();
  });

  it("shows every citation the evaluation carries, each as its own concept.field entry", () => {
    mount({
      evaluation: testEvaluation({
        citations: [
          { concept: "Balance", field: "amount" },
          { concept: "Balance", field: "currency" },
        ],
      }),
    });

    expect(screen.getByText("Balance.amount")).toBeTruthy();
    expect(screen.getByText("Balance.currency")).toBeTruthy();
  });

  it('shows "No citations." when the evaluation carries none', () => {
    mount({ evaluation: testEvaluation({ citations: [] }) });

    expect(screen.getByText("No citations.")).toBeTruthy();
  });
});

describe("CaseSimulationDetailPanel -- the verdict's own color (inference)", () => {
  it("colors a confirmed verdict bg-success", () => {
    mount({
      evaluation: testEvaluation({ hypothesis: "H-confirmed", verdict: "confirmed" }),
      evidence: [],
      hypothesisRevision: testHypothesisRevision({ collects: [] }),
    });

    const region = screen.getByRole("region", { name: "Detail — H-confirmed" });
    // eslint-disable-next-line testing-library/no-node-access -- mirrors this app's own established precedent (case-detail-screen.spec.ts, cases-list-screen.spec.ts): the verdict's color dot is aria-hidden and decorative, so no RTL role/text/label query can reach it directly.
    expect(region.querySelector(".bg-success")).not.toBeNull();
  });

  it("colors a refuted verdict bg-destructive", () => {
    mount({
      evaluation: testEvaluation({ hypothesis: "H-refuted", verdict: "refuted" }),
      evidence: [],
      hypothesisRevision: testHypothesisRevision({ collects: [] }),
    });

    const region = screen.getByRole("region", { name: "Detail — H-refuted" });
    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    expect(region.querySelector(".bg-destructive")).not.toBeNull();
  });

  it("colors an inconclusive verdict bg-warning", () => {
    mount({
      evaluation: testEvaluation({ hypothesis: "H-inconclusive", verdict: "inconclusive" }),
      evidence: [],
      hypothesisRevision: testHypothesisRevision({ collects: [] }),
    });

    const region = screen.getByRole("region", { name: "Detail — H-inconclusive" });
    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    expect(region.querySelector(".bg-warning")).not.toBeNull();
  });
});

describe("CaseSimulationDetailPanel -- the Stale indicator (rules/investigation/a-simulation-result-is-stale-once-its-source-changes)", () => {
  it('shows a "Stale" indicator beside the verdict dot when the evaluation is marked stale', () => {
    mount({ evaluation: testEvaluation({ stale: true }) });

    expect(screen.getByText("Stale")).toBeTruthy();
  });

  it('shows no "Stale" indicator when the evaluation is explicitly not marked stale', () => {
    mount({ evaluation: testEvaluation({ stale: false }) });

    expect(screen.queryByText("Stale")).toBeNull();
  });

  it('shows no "Stale" indicator when the evaluation carries no `stale` field at all', () => {
    mount({ evaluation: testEvaluation() });

    expect(screen.queryByText("Stale")).toBeNull();
  });
});

describe("CaseSimulationDetailPanel -- the hypothesis revision's own criterion text (criterion 2)", () => {
  it("shows the hypothesis revision's own criterion text", () => {
    mount({
      hypothesisRevision: testHypothesisRevision({
        criterion: "The customer disputed a charge posted more than 60 days ago.",
      }),
    });

    expect(
      screen.getByText("The customer disputed a charge posted more than 60 days ago."),
    ).toBeTruthy();
  });
});

describe("CaseSimulationDetailPanel -- default tab and composition", () => {
  it("shows the Evidence tab's own content by default, with no click", () => {
    mount();

    expect(screen.getByText("Balance")).toBeTruthy();
    expect(screen.getByText("translate-text 1.0.0 → deepl-connector")).toBeTruthy();
  });
});

describe("CaseSimulationDetailPanel -- the judgment summary line sits in the Evidence tab (inference)", () => {
  it("shows the judgment summary line on the default (Evidence) tab, but not once the Prompt tab is selected", () => {
    mount({
      evaluation: testEvaluation({
        judgmentCall: testCalledJudgment({
          model: "gpt-4o",
          promptVersion: "v3",
          usage: { inputTokens: 12, outputTokens: 34 },
          elapsedMs: 567,
        }),
      }),
    });

    expect(screen.getByText("Judgment gpt-4o · prompt v3 · 12 tokens in / 34 tokens out · 567 ms")).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "Prompt" }));

    expect(screen.queryByText(/^Judgment /)).toBeNull();
  });
});

describe("CaseSimulationDetailPanel -- composes the Prompt tab with this hypothesis's own judgment call (criterion 4)", () => {
  it("shows this evaluation's own prompt once the Prompt tab is selected", () => {
    const prompt = "SYSTEM: judge the hypothesis\nUSER: here is the evidence for Overdue balance";
    mount({
      evaluation: testEvaluation({
        judgmentCall: testCalledJudgment({ prompt }),
      }),
    });

    fireEvent.click(screen.getByRole("tab", { name: "Prompt" }));

    expect(screen.getByText(prompt, { normalizer: (text) => text })).toBeTruthy();
  });
});

describe("CaseSimulationDetailPanel -- the raw response, verbatim (criterion 5)", () => {
  it("shows the raw response for this hypothesis, exactly and unsummarized, on the JSON tab", () => {
    const rawResponse = {
      hypothesis: "Overdue balance",
      verdict: "confirmed",
      nested: { values: [1, 2, 3], note: "kept as-is" },
    };
    mount({ rawResponse });

    fireEvent.click(screen.getByRole("tab", { name: "JSON" }));

    expect(
      screen.getByText(JSON.stringify(rawResponse, null, 2), { normalizer: (text) => text }),
    ).toBeTruthy();
  });
});

describe("CaseSimulationDetailPanel -- the Detail region's own layout (inference)", () => {
  it("renders the Detail region as a plain, semantic section labeled by the hypothesis's own name, not a TUI Card/Panel/Sheet wrapper", () => {
    mount({ evaluation: testEvaluation({ hypothesis: "Overdue balance" }) });

    expect(screen.getByRole("region", { name: "Detail — Overdue balance" })).toBeTruthy();
  });
});
