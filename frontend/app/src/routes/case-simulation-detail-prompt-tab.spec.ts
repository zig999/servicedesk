import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseSimulationDetailPromptTab } from "./case-simulation-detail-prompt-tab";
import { testCalledJudgment } from "./case-simulation-detail-panel.test-support";
import type { SimulationJudgmentCall } from "./case-simulation-detail-types";

// task/simulation-cockpit/detail-panel's own criterion 4, proven directly against
// CaseSimulationDetailPromptTab.

describe("CaseSimulationDetailPromptTab -- the evaluation's own prompt (criterion 4)", () => {
  it("renders the evaluation's own prompt exactly as materialized, inside a monospace <pre>, when a judgment call happened", () => {
    const prompt =
      "SYSTEM: judge the hypothesis against the evidence below.\nUSER: Balance = 42.";
    render(
      createElement(CaseSimulationDetailPromptTab, {
        judgmentCall: testCalledJudgment({ prompt }),
      }),
    );

    const promptElement = screen.getByText(prompt, { normalizer: (text) => text });
    expect(promptElement.tagName).toBe("PRE");
    expect(promptElement.className).toContain("font-mono");
  });

  it('states "Judgment was never called for this hypothesis." and shows no prompt, for reason no-data', () => {
    const notCalled: SimulationJudgmentCall = { called: false };
    render(createElement(CaseSimulationDetailPromptTab, { judgmentCall: notCalled }));

    expect(screen.getByText("Judgment was never called for this hypothesis.")).toBeTruthy();
    expect(screen.queryByText(/SYSTEM:/)).toBeNull();
  });
});
