import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import {
  CaseSimulationHypothesesTable,
  type CaseSimulationHypothesesTableProps,
} from "./case-simulation-hypotheses-table";
import type { SimulationManifestRow } from "./case-simulation-hypotheses-table-row";

// task/simulation-cockpit/screen-assembly's own divergence: case-simulation-hypotheses-table.tsx
// gained two new, optional props this task's own criteria need -- disableSimulate (criteria 1-2)
// and onSelectHypothesis (criterion 4) -- neither asked for by hypotheses-table's own criteria.
// case-simulation-hypotheses-table.spec.ts's own existing suite already proves every fact that
// table owns on its own and keeps passing unchanged against the extended component (this task's
// own delivery record); this file proves only what the two new props themselves add, mirroring
// that file's own router-mounting shape (a row renders a real Link, so a router context is
// needed) rather than duplicating any of its existing assertions.

const EDIT_ROUTE_PATTERN = "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName";

async function mount(props: CaseSimulationHypothesesTableProps): Promise<void> {
  const rootRoute = createRootRoute({
    component: () => createElement(CaseSimulationHypothesesTable, props),
  });
  const editRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: EDIT_ROUTE_PATTERN,
    component: () => null,
  });
  const routeTree = rootRoute.addChildren([editRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await router.load();
  render(createElement(RouterProvider, { router }));
}

const ROW_1: SimulationManifestRow = {
  position: 1,
  hypothesisName: "H1",
  collects: ["ConceptA"],
};

const ROW_2: SimulationManifestRow = {
  position: 2,
  hypothesisName: "H2",
  collects: ["ConceptB"],
};

function baseProps(
  overrides: Partial<CaseSimulationHypothesesTableProps> = {},
): CaseSimulationHypothesesTableProps {
  return {
    slug: "acme-widgets",
    version: 7,
    rows: [ROW_1, ROW_2],
    onSimulateHypothesis: vi.fn(),
    ...overrides,
  };
}

describe("CaseSimulationHypothesesTable -- disableSimulate gates every row's own Simulate action (task/simulation-cockpit/screen-assembly's own criteria 1-2)", () => {
  it("disables every row's own Simulate button when disableSimulate is true", async () => {
    await mount(baseProps({ disableSimulate: true }));

    const buttons = screen.getAllByRole("button", { name: /Simulate hypothesis at position/ });
    expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      expect(button.hasAttribute("disabled")).toBe(true);
    }
  });

  it("defaults to an enabled Simulate button when disableSimulate is not supplied, preserving hypotheses-table's own already-proven default", async () => {
    await mount(baseProps());

    const buttons = screen.getAllByRole("button", { name: /Simulate hypothesis at position/ });
    for (const button of buttons) {
      expect(button.hasAttribute("disabled")).toBe(false);
    }
  });

  it("never calls the caller's own onSimulateHypothesis for a click on a disabled row's own Simulate button", async () => {
    const onSimulateHypothesis = vi.fn();
    await mount(baseProps({ disableSimulate: true, onSimulateHypothesis }));

    fireEvent.click(screen.getByRole("button", { name: "Simulate hypothesis at position 1" }));

    expect(onSimulateHypothesis).not.toHaveBeenCalled();
  });

  it("leaves a disabled row's own Edit link unaffected, since editing stays available regardless of dispatch state", async () => {
    await mount(baseProps({ disableSimulate: true }));

    const editLink = screen.getAllByRole("link", { name: /Edit hypothesis at position/ })[0];
    expect(editLink.getAttribute("href")).toContain("/manifest/hypotheses/H1");
  });
});

describe("CaseSimulationHypothesesTable -- onSelectHypothesis opens the Detail region for the clicked row (task/simulation-cockpit/screen-assembly's own criterion 4)", () => {
  it("calls onSelectHypothesis with the clicked row's own hypothesis name, resolved by the row's manifest position", async () => {
    const onSelectHypothesis = vi.fn();
    await mount(baseProps({ onSelectHypothesis }));

    // A clickable row carries role="button" (StatusTable's own established convention,
    // status-table.spec.ts), the same role every row's own Simulate <button> carries -- filtering
    // by tagName distinguishes the row element itself from either row's own nested Simulate
    // button.
    const rowElements = screen
      .getAllByRole("button")
      .filter((element) => element.tagName === "TR");
    expect(rowElements).toHaveLength(2);

    fireEvent.click(rowElements[1]);

    expect(onSelectHypothesis).toHaveBeenCalledTimes(1);
    expect(onSelectHypothesis).toHaveBeenCalledWith("H2");
  });

  it("renders no clickable row at all when onSelectHypothesis is absent, matching hypotheses-table's own established inert-by-default behavior", async () => {
    await mount(baseProps());

    // Absent onRowClick, StatusTable never overrides a row's implicit "row" role -- so every
    // row (header plus two data rows) is still findable by that role rather than "button".
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });
});
