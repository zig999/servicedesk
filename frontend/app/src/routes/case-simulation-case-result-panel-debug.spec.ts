import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CaseSimulationCaseResultPanel } from "./case-simulation-case-result-panel";
import type { CaseResultAssessmentCall, CaseResultRun } from "./case-simulation-case-result-types";

function calledAssessment(
  overrides: Partial<Extract<CaseResultAssessmentCall, { called: true }>> = {},
): CaseResultAssessmentCall {
  return {
    called: true,
    outcome: "resolved",
    referral: { action: "notify", recipient: "customer" },
    text: "Thanks for reaching out.",
    register: "formal",
    usage: { inputTokens: 100, outputTokens: 50 },
    elapsedMs: 50,
    prompt: "prompt",
    ...overrides,
  };
}

function makeRun(overrides: Partial<CaseResultRun> = {}): CaseResultRun {
  return {
    id: "run-1",
    ranAt: "2024-01-01T00:00:00.000Z",
    hypotheses: [],
    stale: false,
    durations: { collectionMs: 100, judgmentMs: 200, writingMs: 50, totalMs: 350 },
    cost: { calls: 1, inputTokens: 100, outputTokens: 50 },
    consolidationCall: calledAssessment(),
    rawResponse: {},
    ...overrides,
  };
}

describe("CaseSimulationCaseResultPanel -- the Debug block under Case result (criterion 1)", () => {
  it("presents a Debug block with a Prompt tab once a case simulation run has completed", () => {
    render(createElement(CaseSimulationCaseResultPanel, { runs: [makeRun()] }));

    expect(screen.getByRole("heading", { name: "Debug" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Prompt" })).toBeTruthy();
  });
});

describe("CaseSimulationCaseResultPanel -- the Debug block reflects the shown run (criterion 6)", () => {
  it("presents the earlier run's own consolidation record once that run is shown, in place of the last run's", () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [
          makeRun({
            id: "run-1",
            consolidationCall: calledAssessment({
              usage: { inputTokens: 11, outputTokens: 22 },
              elapsedMs: 33,
              prompt: "earlier prompt",
            }),
          }),
          makeRun({
            id: "run-2",
            consolidationCall: calledAssessment({
              usage: { inputTokens: 44, outputTokens: 55 },
              elapsedMs: 66,
              prompt: "later prompt",
            }),
          }),
        ],
      }),
    );

    expect(screen.getByText("later prompt", { normalizer: (text) => text })).toBeTruthy();
    expect(screen.queryByText("earlier prompt", { normalizer: (text) => text })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Show run #1" }));

    expect(screen.getByText("earlier prompt", { normalizer: (text) => text })).toBeTruthy();
    expect(screen.queryByText("later prompt", { normalizer: (text) => text })).toBeNull();
  });
});
