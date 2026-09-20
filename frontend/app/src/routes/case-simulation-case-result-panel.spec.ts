import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseSimulationCaseResultPanel } from "./case-simulation-case-result-panel";
import type { CaseResultAssessmentCall, CaseResultRun } from "./case-simulation-case-result-types";

function normalized(element: HTMLElement): string {
  return (element.textContent ?? "").replace(/\s+/g, " ").trim();
}

function calledAssessment(
  overrides: Partial<Extract<CaseResultAssessmentCall, { called: true }>> = {},
): CaseResultAssessmentCall {
  return {
    called: true,
    outcome: "resolved",
    referral: { action: "escalate", recipient: "supervisor" },
    determiningHypothesis: "H1",
    text: "Thanks for reaching out; the refund has been issued.",
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

describe("CaseSimulationCaseResultPanel -- rendering only once a run has completed (criterion 1)", () => {
  it("renders nothing when no full-case run has completed this session", () => {
    const { container } = render(createElement(CaseSimulationCaseResultPanel, { runs: [] }));

    expect(container.innerHTML).toBe("");
  });

  it("shows the outcome, the referral and the determining hypothesis of the last run once one has completed", () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [
          makeRun({
            consolidationCall: calledAssessment({
              outcome: "resolved",
              referral: { action: "escalate", recipient: "supervisor" },
              determiningHypothesis: "H1",
            }),
          }),
        ],
      }),
    );

    const line = normalized(screen.getByText(/Outcome/));
    expect(line).toContain("Outcome resolved");
    expect(line).toContain("Referral escalate / supervisor");
    expect(line).toContain("Determining H1");
  });

  it('shows the literal word "Fallback" for the determining hypothesis when nothing confirmed and the fallback answered', () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [makeRun({ consolidationCall: calledAssessment({ determiningHypothesis: undefined }) })],
      }),
    );

    const line = normalized(screen.getByText(/Outcome/));
    expect(line).toContain("Determining Fallback");
  });

  it("shows the most recently completed run's own outcome, not an earlier one, when several runs exist", () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [
          makeRun({ id: "run-1", consolidationCall: calledAssessment({ outcome: "resolved-first" }) }),
          makeRun({ id: "run-2", consolidationCall: calledAssessment({ outcome: "resolved-second" }) }),
        ],
      }),
    );

    const line = screen.getByText(/Outcome/);
    expect(line.textContent).toContain("resolved-second");
    expect(line.textContent).not.toContain("resolved-first");
  });
});

describe("CaseSimulationCaseResultPanel -- the customer-facing text box (criterion 2)", () => {
  it("shows exactly the last run's own customer-facing text, labeled by the register actually used", () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [
          makeRun({
            consolidationCall: calledAssessment({
              text: "Your refund has been processed.",
              register: "plain",
            }),
          }),
        ],
      }),
    );

    expect(screen.getByText("Customer-facing text (plain)")).toBeTruthy();
    expect(screen.getByText("Your refund has been processed.")).toBeTruthy();
  });

  it("shows no other field of the record inside the customer-facing text box", () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [
          makeRun({
            consolidationCall: calledAssessment({
              outcome: "outcome-marker-should-not-leak",
              text: "Your refund has been processed.",
              register: "formal",
            }),
          }),
        ],
      }),
    );

    const label = screen.getByText("Customer-facing text (formal)");
    // eslint-disable-next-line testing-library/no-node-access -- the text box is a plain, unlabeled container; there is no RTL query to scope to it directly, so its own DOM element is reached from an element an RTL query already found, mirroring case-simulation-subject-panel-json-view.spec.ts's own established convention for the same kind of unlabeled structural read.
    const box = label.parentElement;
    expect(box?.textContent).toBe(
      "Customer-facing text (formal)Your refund has been processed.",
    );
  });
});

describe('CaseSimulationCaseResultPanel -- the "stale" marker (criterion 5)', () => {
  it('shows a "Stale" status alongside the outcome line when the last run is marked stale', () => {
    render(createElement(CaseSimulationCaseResultPanel, { runs: [makeRun({ stale: true })] }));

    expect(screen.getByText("Stale")).toBeTruthy();
  });

  it('shows no "Stale" status when the last run is not marked stale', () => {
    render(createElement(CaseSimulationCaseResultPanel, { runs: [makeRun({ stale: false })] }));

    expect(screen.queryByText("Stale")).toBeNull();
  });
});

describe('CaseSimulationCaseResultPanel -- a shown run whose consolidation discriminant states no call happened (criterion 6; UNDERDETERMINED: a static message, never a borrowed or invented value)', () => {
  it("shows an explicit no-call message in place of the outcome line, the customer-facing text box and the Debug > Prompt tab, rather than an empty or dashed placeholder", () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [makeRun({ consolidationCall: { called: false } })],
      }),
    );

    expect(
      screen.getAllByText("No consolidation call was made for this run."),
    ).toHaveLength(3);
  });

  it('shows "no consolidation call" in that run\'s own list caption instead of an outcome', () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [makeRun({ consolidationCall: { called: false } })],
      }),
    );

    expect(screen.getByRole("checkbox", { name: /no consolidation call/ })).toBeTruthy();
  });
});

describe("CaseSimulationCaseResultPanel -- a shown run with no consolidation call borrows nothing from a sibling run (criterion 8)", () => {
  it("keeps every assessment region on the no-call message for the shown run, even though an earlier run in the same session carries its own consolidation answer", () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [
          makeRun({
            id: "run-1",
            consolidationCall: calledAssessment({
              outcome: "sibling-outcome",
              text: "sibling customer text",
            }),
          }),
          makeRun({ id: "run-2", consolidationCall: { called: false } }),
        ],
      }),
    );

    expect(
      screen.getAllByText("No consolidation call was made for this run."),
    ).toHaveLength(3);
    expect(screen.getByRole("checkbox", { name: /sibling-outcome/ })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: /no consolidation call/ })).toBeTruthy();
  });
});
