import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseSimulationCaseResultCompare } from "./case-simulation-case-result-compare";
import type {
  CaseResultRun,
  CaseResultRunHypothesisVerdict,
} from "./case-simulation-case-result-types";

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
    ...overrides,
  };
}

function makeVerdict(
  overrides: Partial<CaseResultRunHypothesisVerdict> = {},
): CaseResultRunHypothesisVerdict {
  return { hypothesis: "H1", verdict: "confirmed", ...overrides };
}

describe("CaseSimulationCaseResultCompare -- side-by-side verdicts (criterion 4)", () => {
  it("shows both runs' own verdict for a hypothesis both of them judged", () => {
    const first = makeRun({
      hypotheses: [makeVerdict({ hypothesis: "H1", verdict: "confirmed" })],
    });
    const second = makeRun({
      hypotheses: [makeVerdict({ hypothesis: "H1", verdict: "refuted" })],
    });

    render(createElement(CaseSimulationCaseResultCompare, { runs: [first, second] }));

    const [firstSide, secondSide] = screen.getAllByText(/^(confirmed|refuted)$/);
    expect(firstSide.textContent).toBe("confirmed");
    expect(secondSide.textContent).toBe("refuted");
  });

  it("shows a plain placeholder on the second run's own side for a hypothesis only the first run judged", () => {
    const first = makeRun({
      hypotheses: [makeVerdict({ hypothesis: "H2", verdict: "inconclusive" })],
    });
    const second = makeRun({ hypotheses: [] });

    render(createElement(CaseSimulationCaseResultCompare, { runs: [first, second] }));

    const [firstSide, secondSide] = screen.getAllByText(/^(inconclusive|—)$/);
    expect(firstSide.textContent).toBe("inconclusive");
    expect(secondSide.textContent).toBe("—");
  });

  it("shows a plain placeholder on the first run's own side for a hypothesis only the second run judged", () => {
    const first = makeRun({ hypotheses: [] });
    const second = makeRun({
      hypotheses: [makeVerdict({ hypothesis: "H3", verdict: "refuted" })],
    });

    render(createElement(CaseSimulationCaseResultCompare, { runs: [first, second] }));

    const [firstSide, secondSide] = screen.getAllByText(/^(—|refuted)$/);
    expect(firstSide.textContent).toBe("—");
    expect(secondSide.textContent).toBe("refuted");
  });

  it("shows one row per hypothesis either run judged, deduplicating a hypothesis both of them judged", () => {
    const first = makeRun({
      hypotheses: [makeVerdict({ hypothesis: "A" }), makeVerdict({ hypothesis: "B" })],
    });
    const second = makeRun({
      hypotheses: [makeVerdict({ hypothesis: "B" }), makeVerdict({ hypothesis: "C" })],
    });

    render(createElement(CaseSimulationCaseResultCompare, { runs: [first, second] }));

    const hypothesisLabels = screen.getAllByText(/^[A-Z]$/);
    expect(hypothesisLabels.map((label) => label.textContent)).toEqual(["A", "B", "C"]);
    expect(screen.getByText("A")).toBeTruthy();
    expect(screen.getByText("B")).toBeTruthy();
    expect(screen.getByText("C")).toBeTruthy();
  });

  it("shows an explicit empty message, rather than an empty list, when neither run judged any hypothesis", () => {
    const first = makeRun({ hypotheses: [] });
    const second = makeRun({ hypotheses: [] });

    render(createElement(CaseSimulationCaseResultCompare, { runs: [first, second] }));

    expect(screen.getByText("Neither run judged a hypothesis.")).toBeTruthy();

    expect(screen.queryAllByText(/^(confirmed|refuted|inconclusive|—)$/)).toHaveLength(0);
  });

  it("never shows a reason alongside a hypothesis's verdict, even when the underlying data happens to carry one", () => {

    function verdictWithExtraReason(): CaseResultRunHypothesisVerdict & { reason: string } {
      return { hypothesis: "H1", verdict: "inconclusive", reason: "no-data" };
    }

    const first = makeRun({ hypotheses: [verdictWithExtraReason()] });
    const second = makeRun({ hypotheses: [] });

    render(createElement(CaseSimulationCaseResultCompare, { runs: [first, second] }));

    expect(screen.getByText("inconclusive")).toBeTruthy();
    expect(screen.queryByText(/no.data/i)).toBeNull();
  });
});
