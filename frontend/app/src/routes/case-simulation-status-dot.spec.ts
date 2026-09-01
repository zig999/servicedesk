import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseSimulationStatusDot } from "./case-simulation-status-dot";

describe("CaseSimulationStatusDot -- the dot-plus-label idiom", () => {
  it("renders the given label as visible text", () => {
    render(createElement(CaseSimulationStatusDot, { color: "bg-success", label: "confirmed" }));

    expect(screen.getByText("confirmed")).toBeTruthy();
  });

  it("renders the given color as a class on a decorative, aria-hidden dot alongside the label", () => {
    render(
      createElement(CaseSimulationStatusDot, { color: "bg-success", label: "confirmed" }),
    );

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
