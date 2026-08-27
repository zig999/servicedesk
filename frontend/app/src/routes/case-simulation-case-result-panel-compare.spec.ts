import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CaseSimulationCaseResultPanel } from "./case-simulation-case-result-panel";
import type { CaseResultRun } from "./case-simulation-case-result-types";

// task/simulation-cockpit/case-result-panel's own criterion 4 (the "Compare" action) and this
// task's own disclosed selection-mechanism inference (a checkbox per history row, gating a
// "Compare" button, dropping the oldest of two already-checked runs when a third is checked).
// Split out of case-simulation-case-result-panel.spec.ts (criteria 1, 2 and 5) to keep each file
// within one reviewable size, mirroring connector-test-panel's own established convention of
// several concern-scoped spec files over one source file. No @testing-library/jest-dom matcher
// is used anywhere in this project's suite (not installed by this registry) -- checked/disabled
// state is read directly off the native input/button element instead.

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

/** Locates the history row's own checkbox by its leading "#<position>" label text, without
 * depending on the exact (locale-formatted) time text that label also carries. */
function checkboxAtPosition(position: number): HTMLInputElement {
  const checkbox = screen.getByRole("checkbox", { name: new RegExp(`^#${position}\\b`) });
  if (!(checkbox instanceof HTMLInputElement)) {
    throw new Error("case-simulation-case-result-panel-compare.spec.ts: expected an <input> checkbox");
  }
  return checkbox;
}

function compareButton(): HTMLButtonElement {
  const button = screen.getByRole("button", { name: "Compare" });
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("case-simulation-case-result-panel-compare.spec.ts: expected a <button> element");
  }
  return button;
}

describe('CaseSimulationCaseResultPanel -- gating the "Compare" button on exactly two selected runs (criterion 4)', () => {
  it("keeps the Compare button disabled until exactly two runs are checked", () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [makeRun({ id: "r1" }), makeRun({ id: "r2" }), makeRun({ id: "r3" })],
      }),
    );

    expect(compareButton().disabled).toBe(true);

    fireEvent.click(checkboxAtPosition(1));
    expect(compareButton().disabled).toBe(true);

    fireEvent.click(checkboxAtPosition(2));
    expect(compareButton().disabled).toBe(false);
  });

  it("unchecking a checked run's own checkbox drops it back out of the selection, keeping the Compare button disabled until two are checked again", () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [makeRun({ id: "r1" }), makeRun({ id: "r2" })],
      }),
    );

    fireEvent.click(checkboxAtPosition(1));
    fireEvent.click(checkboxAtPosition(1));

    expect(checkboxAtPosition(1).checked).toBe(false);
    expect(compareButton().disabled).toBe(true);
  });

  it("drops the oldest of two already-checked runs when a third is checked, rather than growing past two", () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [makeRun({ id: "r1" }), makeRun({ id: "r2" }), makeRun({ id: "r3" })],
      }),
    );

    fireEvent.click(checkboxAtPosition(1));
    fireEvent.click(checkboxAtPosition(2));
    fireEvent.click(checkboxAtPosition(3));

    expect(checkboxAtPosition(1).checked).toBe(false);
    expect(checkboxAtPosition(2).checked).toBe(true);
    expect(checkboxAtPosition(3).checked).toBe(true);
    expect(compareButton().disabled).toBe(false);
  });
});

describe("CaseSimulationCaseResultPanel -- showing the Compare view (criterion 4)", () => {
  it("shows no Compare view before the button has been clicked, even once two runs are checked", () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [makeRun({ id: "r1" }), makeRun({ id: "r2" })],
      }),
    );

    fireEvent.click(checkboxAtPosition(1));
    fireEvent.click(checkboxAtPosition(2));

    expect(screen.queryByLabelText("Compare runs")).toBeNull();
  });

  it("renders the Compare view for exactly the two checked runs once Compare is clicked", () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [
          makeRun({
            id: "r1",
            hypotheses: [{ hypothesis: "H1", verdict: "confirmed" }],
          }),
          makeRun({
            id: "r2",
            hypotheses: [{ hypothesis: "H1", verdict: "refuted" }],
          }),
        ],
      }),
    );

    fireEvent.click(checkboxAtPosition(1));
    fireEvent.click(checkboxAtPosition(2));
    fireEvent.click(compareButton());

    expect(screen.getByLabelText("Compare runs")).toBeTruthy();
    expect(screen.getByText("H1")).toBeTruthy();
  });

  it("keeps the Compare view's two columns in this session's own chronological order, never the order the two runs were checked", () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [
          makeRun({
            id: "r1",
            hypotheses: [{ hypothesis: "H1", verdict: "confirmed" }],
          }),
          makeRun({
            id: "r2",
            hypotheses: [{ hypothesis: "H1", verdict: "refuted" }],
          }),
        ],
      }),
    );

    // Checked in reverse chronological order (position 2 before position 1): an implementation
    // resolving the Compare view by selection order, rather than by history order, would show
    // "refuted" (run r2) in the first column here instead of "confirmed" (run r1).
    fireEvent.click(checkboxAtPosition(2));
    fireEvent.click(checkboxAtPosition(1));
    fireEvent.click(compareButton());

    expect(screen.getByText("H1")).toBeTruthy();
    // The Compare row carries no role or label of its own (a plain grid `<div>`), so which
    // column a verdict landed in is read through Testing Library's own query-ordering guarantee
    // -- screen.getAllByText(...) returns matches in document order, the same left-to-right
    // column order this component renders in -- rather than through row.children, mirroring
    // case-simulation-case-result-compare.spec.ts's own identical convention.
    const [firstColumn, secondColumn] = screen.getAllByText(/^(confirmed|refuted)$/);
    expect(firstColumn.textContent).toBe("confirmed");
    expect(secondColumn.textContent).toBe("refuted");
  });
});
