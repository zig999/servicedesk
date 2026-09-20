import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CaseSimulationCaseResultPanel } from "./case-simulation-case-result-panel";
import type { CaseResultRun } from "./case-simulation-case-result-types";

function makeRun(overrides: Partial<CaseResultRun> = {}): CaseResultRun {
  return {
    id: "run-1",
    ranAt: "2024-01-01T00:00:00.000Z",
    hypotheses: [],
    stale: false,
    durations: { collectionMs: 100, judgmentMs: 200, writingMs: 50, totalMs: 350 },
    cost: { calls: 1, inputTokens: 100, outputTokens: 50 },
    consolidationCall: {
      called: true,
      outcome: "resolved",
      referral: { action: "notify", recipient: "customer" },
      text: "Thanks for reaching out.",
      register: "formal",
      usage: { inputTokens: 100, outputTokens: 50 },
      elapsedMs: 50,
      prompt: "prompt",
    },
    rawResponse: {},
    ...overrides,
  };
}

describe("CaseSimulationCaseResultPanel -- the JSON tab reflects the shown run's own payload (criterion 7)", () => {
  it("presents the earlier run's own raw payload once that run is shown, in place of the last run's", () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [
          makeRun({ id: "run-1", rawResponse: { marker: "earlier-run-payload" } }),
          makeRun({ id: "run-2", rawResponse: { marker: "later-run-payload" } }),
        ],
      }),
    );

    fireEvent.click(screen.getByRole("tab", { name: "JSON" }));

    expect(
      screen.getByText(JSON.stringify({ marker: "later-run-payload" }, null, 2), {
        normalizer: (text) => text,
      }),
    ).toBeTruthy();
    expect(
      screen.queryByText(JSON.stringify({ marker: "earlier-run-payload" }, null, 2), {
        normalizer: (text) => text,
      }),
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Show run #1" }));

    expect(
      screen.getByText(JSON.stringify({ marker: "earlier-run-payload" }, null, 2), {
        normalizer: (text) => text,
      }),
    ).toBeTruthy();
    expect(
      screen.queryByText(JSON.stringify({ marker: "later-run-payload" }, null, 2), {
        normalizer: (text) => text,
      }),
    ).toBeNull();
  });
});
