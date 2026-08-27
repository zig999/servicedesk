import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseSimulationCaseResultPanel } from "./case-simulation-case-result-panel";
import type { CaseResultRun } from "./case-simulation-case-result-types";

// task/simulation-cockpit/case-result-panel's own criteria 1, 2 and 5 -- whether the region
// renders at all, the outcome/referral/determining line (with the "Fallback" inference), the
// customer-facing text box's own exact contents, and the "stale" marker. Criterion 4 (Compare)
// is a separate concern this task's own selection state and gating decide, proven in
// case-simulation-case-result-panel-compare.spec.ts, so it stays out of this file to keep it
// within one reviewable size. No router, no query client, no fetch -- this component is
// presentational and props-driven, so it is rendered directly, mirroring
// case-simulation-hypotheses-table.spec.ts's own convention with no router needed here.

/** Collapses whatever whitespace JSX line breaks left in an element's own textContent, so an
 * assertion states the words and their order rather than an incidental spacing/line-break
 * artifact of how the source happens to be wrapped. */
function normalized(element: HTMLElement): string {
  return (element.textContent ?? "").replace(/\s+/g, " ").trim();
}

function makeRun(overrides: Partial<CaseResultRun> = {}): CaseResultRun {
  return {
    id: "run-1",
    ranAt: "2024-01-01T00:00:00.000Z",
    outcome: "resolved",
    referral: { action: "escalate", recipient: "supervisor" },
    determiningHypothesis: "H1",
    text: "Thanks for reaching out; the refund has been issued.",
    register: "formal",
    hypotheses: [],
    stale: false,
    ...overrides,
  };
}

describe("CaseSimulationCaseResultPanel -- rendering only once a run has completed (criterion 1)", () => {
  it("renders nothing when no full-case run has completed this session", () => {
    const { container } = render(createElement(CaseSimulationCaseResultPanel, { runs: [] }));

    // `.innerHTML` is a plain serialization read, never a `container` method call
    // (testing-library/no-container) nor a listed Node-traversal property
    // (testing-library/no-node-access) -- there is no RTL query for "nothing rendered".
    expect(container.innerHTML).toBe("");
  });

  it("shows the outcome, the referral and the determining hypothesis of the last run once one has completed", () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [makeRun({ outcome: "resolved", referral: { action: "escalate", recipient: "supervisor" }, determiningHypothesis: "H1" })],
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
        runs: [makeRun({ determiningHypothesis: undefined })],
      }),
    );

    const line = normalized(screen.getByText(/Outcome/));
    expect(line).toContain("Determining Fallback");
  });

  it("shows the most recently completed run's own outcome, not an earlier one, when several runs exist", () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [
          makeRun({ id: "run-1", outcome: "resolved-first" }),
          makeRun({ id: "run-2", outcome: "resolved-second" }),
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
        runs: [makeRun({ text: "Your refund has been processed.", register: "plain" })],
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
            outcome: "outcome-marker-should-not-leak",
            text: "Your refund has been processed.",
            register: "formal",
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
