import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CaseSimulationDetailPanel } from "./case-simulation-detail-panel";
import { testHypothesisRevision } from "./case-simulation-detail-panel.test-support";
import {
  fromCaseEvaluation,
  fromHypothesisEvaluation,
  toDetailEvaluation,
} from "./case-simulation-cockpit-adapters";
import type { CaseSimulationDetailPanelProps } from "./case-simulation-detail-types";
import type {
  Evaluation as HypothesisEvaluation,
  Evidence as HypothesisEvidenceItem,
} from "../hooks/use-simulate-hypothesis";
import type { SimulateEvaluation } from "../hooks/use-simulate-case";

// task/simulation-detail-hypothesis-hotfix/wire-hypothesis-evidence-and-prompt (a corrective
// increment): proves the fix at the rendered tab, composing CaseSimulationDetailPanelProps
// through the real, modified adapters (fromHypothesisEvaluation, fromCaseEvaluation,
// toDetailEvaluation) rather than through case-simulation-detail-panel.test-support.ts's own
// hand-built literals -- a purely fixture-driven render proves only that the panel renders
// whatever it is given, never that the adapters now hand it a single-hypothesis run's own
// evidence and prompt instead of nothing (this task's own reproduction: both tabs previously
// rendered empty/placeholder for a response that actually carried real evidence and a real
// prompt). The adapter-level data-transformation proof for the same two functions lives in
// case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts.

describe("CaseSimulationDetailPanel -- a single-hypothesis run's own evidence reaches the Evidence tab (criterion 1)", () => {
  it("renders the collected evidence item a single-hypothesis simulation's response actually carried, the same way a full-case simulation's evidence already renders", () => {
    const evaluation: HypothesisEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      citations: [{ concept: "billing-history", field: "observation" }],
    };
    const evidence: readonly HypothesisEvidenceItem[] = [
      {
        concept: "billing-history",
        inputs: "{}",
        observation: "the account shows one authorized charge",
        observed_at: "2026-08-01T00:00:00.000Z",
        ttl: 3600,
        origin: "billing-connector",
        result: "ok",
        capability_name: "fetch-billing-account",
        capability_version: "1",
        elapsed_ms: 120,
      },
    ];
    const normalized = fromHypothesisEvaluation(evaluation, evidence);

    const props: CaseSimulationDetailPanelProps = {
      hypothesisRevision: testHypothesisRevision({ collects: ["billing-history"] }),
      evaluation: toDetailEvaluation(normalized),
      evidence: normalized.evidence ?? [],
      rawResponse: normalized.raw,
    };

    render(createElement(CaseSimulationDetailPanel, props));

    expect(screen.getByText("billing-history")).toBeTruthy();
    expect(screen.getByText("fetch-billing-account 1 → billing-connector")).toBeTruthy();
  });
});

describe("CaseSimulationDetailPanel -- a single-hypothesis run with no evidence renders the empty state, not an error (criterion 2)", () => {
  it('shows "No evidence collected for this hypothesis." rather than throwing or rendering nothing', () => {
    const evaluation: HypothesisEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "inconclusive",
      reason: "no-data",
      citations: [],
    };
    const normalized = fromHypothesisEvaluation(evaluation, []);

    const props: CaseSimulationDetailPanelProps = {
      hypothesisRevision: testHypothesisRevision({ collects: ["billing-history"] }),
      evaluation: toDetailEvaluation(normalized),
      evidence: normalized.evidence ?? [],
      rawResponse: normalized.raw,
    };

    expect(() => render(createElement(CaseSimulationDetailPanel, props))).not.toThrow();
    expect(screen.getByText("No evidence collected for this hypothesis.")).toBeTruthy();
  });
});

describe("CaseSimulationDetailPanel -- a single-hypothesis run's own real prompt reaches the Prompt tab (criterion 3)", () => {
  it("shows the evaluation's own real prompt once the Prompt tab is selected, not the never-called placeholder", () => {
    const evaluation: HypothesisEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      citations: [{ concept: "billing-history", field: "observation" }],
      usage: { input_tokens: 12, output_tokens: 34 },
      elapsed_ms: 567,
      prompt: "SYSTEM: judge hypothesis-a\nUSER: here is the billing history",
    };
    const normalized = fromHypothesisEvaluation(evaluation, []);

    const props: CaseSimulationDetailPanelProps = {
      hypothesisRevision: testHypothesisRevision(),
      evaluation: toDetailEvaluation(normalized),
      evidence: [],
      rawResponse: normalized.raw,
    };

    render(createElement(CaseSimulationDetailPanel, props));
    fireEvent.click(screen.getByRole("tab", { name: "Prompt" }));

    expect(
      screen.getByText("SYSTEM: judge hypothesis-a\nUSER: here is the billing history", {
        normalizer: (text) => text,
      }),
    ).toBeTruthy();
    expect(screen.queryByText("Judgment was never called for this hypothesis.")).toBeNull();
  });
});

describe("CaseSimulationDetailPanel -- a no-data single-hypothesis evaluation still shows the never-called placeholder (criterion 4)", () => {
  it('keeps showing "Judgment was never called for this hypothesis." for an inconclusive, no-data evaluation carrying no usage/elapsed_ms/prompt', () => {
    const evaluation: HypothesisEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "inconclusive",
      reason: "no-data",
      citations: [],
    };
    const normalized = fromHypothesisEvaluation(evaluation, []);

    const props: CaseSimulationDetailPanelProps = {
      hypothesisRevision: testHypothesisRevision(),
      evaluation: toDetailEvaluation(normalized),
      evidence: [],
      rawResponse: normalized.raw,
    };

    render(createElement(CaseSimulationDetailPanel, props));
    fireEvent.click(screen.getByRole("tab", { name: "Prompt" }));

    expect(screen.getByText("Judgment was never called for this hypothesis.")).toBeTruthy();
  });
});

describe("CaseSimulationDetailPanel -- the same fix reaches a full-case run's own Prompt tab (criterion 5)", () => {
  it("shows a case-sourced evaluation's own real prompt once the Prompt tab is selected", () => {
    const evaluation: SimulateEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "refuted",
      citations: [{ concept: "billing-history", field: "observation" }],
      usage: { input_tokens: 200, output_tokens: 90 },
      elapsed_ms: 950,
      prompt: "consolidate the case-level judgment for hypothesis-a",
    };
    const normalized = fromCaseEvaluation(evaluation);

    const props: CaseSimulationDetailPanelProps = {
      hypothesisRevision: testHypothesisRevision(),
      evaluation: toDetailEvaluation(normalized),
      evidence: [],
      rawResponse: normalized.raw,
    };

    render(createElement(CaseSimulationDetailPanel, props));
    fireEvent.click(screen.getByRole("tab", { name: "Prompt" }));

    expect(
      screen.getByText("consolidate the case-level judgment for hypothesis-a", {
        normalizer: (text) => text,
      }),
    ).toBeTruthy();
  });
});

describe("CaseSimulationDetailPanel -- the rest of the Detail panel stays correct once real evidence and judgment data flow through (criterion 7)", () => {
  it("still shows the verdict, every citation, the hypothesis revision's own criterion text and the Stale indicator for a hypothesis-sourced evaluation that now also carries evidence and a judgment call", () => {
    const evaluation: HypothesisEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "refuted",
      citations: [{ concept: "billing-history", field: "observation" }],
      usage: { input_tokens: 12, output_tokens: 34 },
      elapsed_ms: 567,
      prompt: "SYSTEM: judge hypothesis-a",
    };
    const evidence: readonly HypothesisEvidenceItem[] = [
      {
        concept: "billing-history",
        inputs: "{}",
        observation: "the account shows one authorized charge",
        observed_at: "2026-08-01T00:00:00.000Z",
        ttl: 3600,
        origin: "billing-connector",
        result: "ok",
        capability_name: "fetch-billing-account",
        capability_version: "1",
        elapsed_ms: 120,
      },
    ];
    const normalized = { ...fromHypothesisEvaluation(evaluation, evidence), stale: true };

    const props: CaseSimulationDetailPanelProps = {
      hypothesisRevision: testHypothesisRevision({
        collects: ["billing-history"],
        criterion: "The account shows a duplicate charge.",
      }),
      evaluation: toDetailEvaluation(normalized),
      evidence: normalized.evidence ?? [],
      rawResponse: normalized.raw,
    };

    render(createElement(CaseSimulationDetailPanel, props));

    expect(screen.getByText("refuted")).toBeTruthy();
    expect(screen.getByText("billing-history.observation")).toBeTruthy();
    expect(screen.getByText("The account shows a duplicate charge.")).toBeTruthy();
    expect(screen.getByText("Stale")).toBeTruthy();
  });
});
