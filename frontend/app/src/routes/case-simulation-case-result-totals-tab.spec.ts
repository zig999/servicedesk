import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseSimulationCaseResultTotalsTab } from "./case-simulation-case-result-totals-tab";

function normalized(element: HTMLElement): string {
  return (element.textContent ?? "").replace(/\s+/g, " ").trim();
}

describe("CaseSimulationCaseResultTotalsTab -- the run's own cost totals (criteria 1, 2)", () => {
  it("renders the run's total call count and its total input and output token counts", () => {
    render(
      createElement(CaseSimulationCaseResultTotalsTab, {
        cost: { calls: 7, inputTokens: 321, outputTokens: 654 },
        durations: { collectionMs: 1, judgmentMs: 1, totalMs: 1 },
      }),
    );

    const line = normalized(screen.getByText(/calls/));
    expect(line).toContain("7 calls");
    expect(line).toContain("321 tokens in");
    expect(line).toContain("654 tokens out");
  });
});

describe(
  "CaseSimulationCaseResultTotalsTab -- durations shown as the run's own recorded figures " +
    "(criterion 3; UNDERDETERMINED -- total is not a stage sum)",
  () => {
    it(
      "renders the run's collection, judgment and total durations, with total taken from the " +
        "run's own recorded total rather than the sum of the stages it also shows",
      () => {
        // collectionMs + judgmentMs + writingMs = 350 here; totalMs is deliberately a
        // different figure, so an implementation that summed the stages instead of reading
        // the run's own recorded total would render 350 where this asserts 999.
        render(
          createElement(CaseSimulationCaseResultTotalsTab, {
            cost: { calls: 1, inputTokens: 1, outputTokens: 1 },
            durations: { collectionMs: 100, judgmentMs: 200, writingMs: 50, totalMs: 999 },
          }),
        );

        const line = normalized(screen.getByText(/Collection/));
        expect(line).toContain("Collection 100ms");
        expect(line).toContain("Judgment 200ms");
        expect(line).toContain("Total 999ms");
        expect(line).not.toContain("Total 350ms");
      },
    );
  },
);

describe("CaseSimulationCaseResultTotalsTab -- no writing figure when the run recorded none (criterion 4)", () => {
  it("shows no writing figure at all for a run whose durations carry no writingMs, rather than a zero", () => {
    render(
      createElement(CaseSimulationCaseResultTotalsTab, {
        cost: { calls: 1, inputTokens: 1, outputTokens: 1 },
        durations: { collectionMs: 100, judgmentMs: 200, totalMs: 300 },
      }),
    );

    const line = normalized(screen.getByText(/Collection/));
    expect(line).toContain("Collection 100ms");
    expect(line).toContain("Judgment 200ms");
    expect(line).toContain("Total 300ms");
    expect(line).not.toContain("Writing");
  });
});
