import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CaseSimulationCaseResultPanel } from "./case-simulation-case-result-panel";
import type { CaseResultRun } from "./case-simulation-case-result-types";

function normalized(element: HTMLElement): string {
  return (element.textContent ?? "").replace(/\s+/g, " ").trim();
}

function makeRun(overrides: Partial<CaseResultRun> = {}): CaseResultRun {
  return {
    id: "run-1",
    ranAt: "2024-01-01T00:00:00.000Z",
    outcome: "resolved",
    referral: { action: "notify", recipient: "customer" },
    text: "Thanks for reaching out.",
    register: "formal",
    hypotheses: [],
    stale: false,
    durations: { collectionMs: 100, judgmentMs: 200, writingMs: 50, totalMs: 350 },
    cost: { calls: 1, inputTokens: 100, outputTokens: 50 },
    consolidationCall: {
      called: true,
      usage: { inputTokens: 100, outputTokens: 50 },
      elapsedMs: 50,
      prompt: "prompt",
    },
    rawResponse: {},
    ...overrides,
  };
}

describe("CaseSimulationCaseResultPanel -- the Totals tab reflects the shown run (criterion 5)", () => {
  it("presents the earlier run's own cost and durations once that run is shown, in place of the last run's", () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [
          makeRun({
            id: "run-1",
            cost: { calls: 11, inputTokens: 111, outputTokens: 222 },
            durations: { collectionMs: 11, judgmentMs: 22, writingMs: 33, totalMs: 44 },
          }),
          makeRun({
            id: "run-2",
            cost: { calls: 99, inputTokens: 999, outputTokens: 888 },
            durations: { collectionMs: 55, judgmentMs: 66, writingMs: 77, totalMs: 88 },
          }),
        ],
      }),
    );

    fireEvent.click(screen.getByRole("tab", { name: "Totals" }));

    const lastRunLine = normalized(screen.getByText(/tokens in/));
    expect(lastRunLine).toContain("99 calls");
    expect(lastRunLine).not.toContain("11 calls");

    fireEvent.click(screen.getByRole("button", { name: "Show run #1" }));

    const earlierRunLine = normalized(screen.getByText(/tokens in/));
    expect(earlierRunLine).toContain("11 calls");
    expect(earlierRunLine).not.toContain("99 calls");
  });
});
