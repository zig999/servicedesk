import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { StatusTable } from "./status-table";
import type { StatusTableColumn, StatusTableRow } from "./status-table";

// This file stays .spec.ts (not .spec.tsx), matching this codebase's existing
// convention for component specs (see conflict-banner.spec.ts). Rendering is
// done through React.createElement rather than JSX syntax, since a .ts file
// is parsed by esbuild's "ts" loader, which does not accept JSX.
//
// vite.config.ts's test.globals: true registers @testing-library/react's own
// auto-cleanup against the global afterEach, so no manual cleanup() call is
// needed here (testing-library/no-manual-cleanup).

describe("StatusTable", () => {
  it("renders a header cell labeled for each given column", () => {
    const columns: StatusTableColumn[] = [
      { key: "fullName", header: "Full name" },
      { key: "department", header: "Department" },
    ];

    render(createElement(StatusTable, { columns, rows: [] }));

    expect(screen.getByRole("table")).toBeTruthy();
    const headerLabels = screen
      .getAllByRole("columnheader")
      .map((cell) => cell.textContent);
    expect(headerLabels).toEqual(["Full name", "Department"]);
    expect(screen.getAllByRole("row")).toHaveLength(1);
  });

  it("renders a table row per given row with each column's value as a cell", () => {
    const columns: StatusTableColumn[] = [
      { key: "fullName", header: "Full name" },
      { key: "department", header: "Department" },
    ];
    const rows: StatusTableRow[] = [
      { fullName: "Alice Souza", department: "Engineering" },
      { fullName: "Bruno Lima", department: "Sales" },
    ];

    render(createElement(StatusTable, { columns, rows }));

    expect(screen.getByText("Alice Souza")).toBeTruthy();
    expect(screen.getByText("Engineering")).toBeTruthy();
    expect(screen.getByText("Bruno Lima")).toBeTruthy();
    expect(screen.getByText("Sales")).toBeTruthy();
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  it("renders an empty cell rather than throwing when a row lacks a given column's field", () => {
    const columns: StatusTableColumn[] = [
      { key: "a", header: "A" },
      { key: "b", header: "B" },
    ];
    const rows: StatusTableRow[] = [{ a: "x" }];

    expect(() =>
      render(createElement(StatusTable, { columns, rows })),
    ).not.toThrow();
    expect(screen.getByText("x")).toBeTruthy();
    const cells = screen.getAllByRole("cell");
    expect(cells).toHaveLength(2);
    expect(cells[1].textContent).toBe("");
  });

  it("calls onRowClick with exactly the clicked row's data, not another row's", () => {
    const columns: StatusTableColumn[] = [{ key: "name", header: "Name" }];
    const rows: StatusTableRow[] = [{ name: "First" }, { name: "Second" }];
    const onRowClick = vi.fn();

    render(createElement(StatusTable, { columns, rows, onRowClick }));

    // A clickable row carries role="button" (StatusTable overrides the
    // implicit "row" role precisely so an interactive row is exposed as
    // interactive), so getAllByRole("row") would not find it at all -- the
    // header row keeps its implicit "row" role since it is never clickable,
    // but it never gets a "button" role, so this list holds only data rows,
    // in order. "Second" is the second data row, index 1.
    const target = screen.getAllByRole("button")[1];
    fireEvent.click(target);

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(rows[1]);
  });

  it("renders no anchor element for a clickable row", () => {
    const columns: StatusTableColumn[] = [{ key: "name", header: "Name" }];
    const rows: StatusTableRow[] = [{ name: "Only" }];

    render(createElement(StatusTable, { columns, rows, onRowClick: vi.fn() }));

    expect(screen.queryByRole("link")).toBeNull();
  });

  it("activates onRowClick when Enter is pressed on the row", () => {
    const columns: StatusTableColumn[] = [{ key: "name", header: "Name" }];
    const rows: StatusTableRow[] = [{ name: "Only" }];
    const onRowClick = vi.fn();

    render(createElement(StatusTable, { columns, rows, onRowClick }));

    // Single clickable row: role="button", not the header's implicit "row".
    const target = screen.getAllByRole("button")[0];
    fireEvent.keyDown(target, { key: "Enter" });

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it("activates onRowClick when Space is pressed on the row", () => {
    const columns: StatusTableColumn[] = [{ key: "name", header: "Name" }];
    const rows: StatusTableRow[] = [{ name: "Only" }];
    const onRowClick = vi.fn();

    render(createElement(StatusTable, { columns, rows, onRowClick }));

    const target = screen.getAllByRole("button")[0];
    fireEvent.keyDown(target, { key: " " });

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it("does not activate onRowClick for a key other than Enter or Space", () => {
    const columns: StatusTableColumn[] = [{ key: "name", header: "Name" }];
    const rows: StatusTableRow[] = [{ name: "Only" }];
    const onRowClick = vi.fn();

    render(createElement(StatusTable, { columns, rows, onRowClick }));

    const target = screen.getAllByRole("button")[0];
    fireEvent.keyDown(target, { key: "a" });

    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("gives a row with no onRowClick neither an interactive role nor a tab stop", () => {
    const columns: StatusTableColumn[] = [{ key: "name", header: "Name" }];
    const rows: StatusTableRow[] = [{ name: "Inert" }];

    render(createElement(StatusTable, { columns, rows }));

    const target = screen.getAllByRole("row")[1];
    expect(target.getAttribute("role")).toBeNull();
    expect(target.hasAttribute("tabindex")).toBe(false);
  });

  it("renders a status cell's color indicator together with its label", () => {
    const columns: StatusTableColumn[] = [{ key: "status", header: "Status" }];
    const rows: StatusTableRow[] = [
      { status: { color: "bg-emerald-500", label: "Active" } },
    ];

    render(createElement(StatusTable, { columns, rows }));

    const cell = screen.getAllByRole("cell")[0];
    expect(within(cell).getByText("Active")).toBeTruthy();
    // The color dot is `aria-hidden="true"` (decorative) by design, so it is
    // excluded from the accessibility tree and no Testing Library query --
    // role, text, or label -- can find it; a direct query is the only way to
    // confirm it renders alongside the label, mirroring what a sighted user
    // still perceives even though assistive tech does not.
    // eslint-disable-next-line testing-library/no-node-access -- see comment above; the indicator is intentionally aria-hidden and unreachable by any RTL query
    const indicator = cell.querySelector(".bg-emerald-500");
    expect(indicator).not.toBeNull();
  });

  it("never renders a color indicator for a value carrying only a color and no label", () => {
    const columns: StatusTableColumn[] = [{ key: "status", header: "Status" }];
    const rows: StatusTableRow[] = [{ status: { color: "bg-red-500" } }];

    render(createElement(StatusTable, { columns, rows }));

    const table = screen.getByRole("table");
    // Same reasoning as above: absence of a decorative, aria-hidden indicator
    // cannot be asserted through any accessibility-tree-based query, since
    // such an element (present or absent) never appears in that tree either way.
    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    expect(table.querySelector(".bg-red-500")).toBeNull();
  });

  it("renders a plain, non-status cell value as itself with no color indicator", () => {
    const columns: StatusTableColumn[] = [{ key: "count", header: "Count" }];
    const rows: StatusTableRow[] = [{ count: 42 }];

    render(createElement(StatusTable, { columns, rows }));

    const cell = screen.getAllByRole("cell")[0];
    expect(cell.textContent).toBe("42");
  });
});
