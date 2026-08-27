import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseSimulationStatusDot } from "./case-simulation-status-dot";

// task/simulation-cockpit/detail-panel composes this shared dot-plus-label idiom for both the
// hypothesis's own verdict (criterion 1) and each evidence item's own result (criterion 3) --
// case-simulation-detail-panel.spec.ts and case-simulation-detail-evidence-tab.spec.ts each
// prove a color is present at their own call site, but neither proves the idiom itself: that a
// given color and a given label always render together, as one unit, whatever the caller passes.
// This file proves that unit directly, independent of either caller.

describe("CaseSimulationStatusDot -- the dot-plus-label idiom", () => {
  it("renders the given label as visible text", () => {
    render(createElement(CaseSimulationStatusDot, { color: "bg-success", label: "confirmed" }));

    expect(screen.getByText("confirmed")).toBeTruthy();
  });

  it("renders the given color as a class on a decorative, aria-hidden dot alongside the label", () => {
    render(
      createElement(CaseSimulationStatusDot, { color: "bg-success", label: "confirmed" }),
    );

    // The dot is aria-hidden by design (ACC-08's pairing is the label, not the dot), so no RTL
    // role/text/label query can reach it -- mirrors this app's own established precedent
    // (status-table.spec.ts's own identical comment for the same idiom). The label's own
    // wrapping element is located through an RTL query (getByText) rather than render()'s own
    // container (testing-library/no-container), and the dot is then reached from there.
    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    const dot = screen.getByText("confirmed").parentElement?.querySelector(".bg-success");
    expect(dot).not.toBeNull();
    expect(dot?.getAttribute("aria-hidden")).toBe("true");
  });

  it("swaps the rendered color class when a different color prop is given, rather than accumulating both", () => {
    const { rerender } = render(
      createElement(CaseSimulationStatusDot, { color: "bg-success", label: "confirmed" }),
    );
    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    expect(screen.getByText("confirmed").parentElement?.querySelector(".bg-success")).not.toBeNull();

    rerender(createElement(CaseSimulationStatusDot, { color: "bg-destructive", label: "refuted" }));

    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    expect(screen.queryByText("refuted")?.parentElement?.querySelector(".bg-success")).toBeNull();
    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    expect(screen.getByText("refuted").parentElement?.querySelector(".bg-destructive")).not.toBeNull();
    expect(screen.getByText("refuted")).toBeTruthy();
  });
});
