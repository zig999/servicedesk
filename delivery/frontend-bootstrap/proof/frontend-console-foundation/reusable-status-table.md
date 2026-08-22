---
title: Proof for the reusable StatusTable component
summary: Twelve render-based tests over StatusTable cover header/row/cell projection, missing-field tolerance, click and keyboard activation scoped to the exact clicked row, inert-row semantics, and the status-value color indicator's presence and absence.
implementation: sha256:6129855a436592bb3b7b8b4ad1368f73019d70b74c34a639b72cd56105ef239d
run: run/frontend-console-foundation-onda-1-full-suite-2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631
tests:
  - file: src/shared/components/status-table.spec.ts
    name: renders a header cell labeled for each given column
    proves: each configured column produces exactly one labeled header cell, in the given order, with no extra data row present for an empty row set
    fails_when: a column is dropped, mislabeled, reordered, or an empty row set still renders a phantom data row
  - file: src/shared/components/status-table.spec.ts
    name: renders a table row per given row with each column's value as a cell
    proves: each row becomes one table row and each column's value for that row appears as text, for every row given
    fails_when: a row is skipped, duplicated, or a cell's value is missing, swapped with another row's, or not rendered at all
  - file: src/shared/components/status-table.spec.ts
    name: renders an empty cell rather than throwing when a row lacks a given column's field
    proves: a row missing one of the declared columns' keys still renders without throwing, producing an empty cell for that column rather than omitting the cell or crashing
    fails_when: rendering throws on a missing field, or the cell for the missing field is omitted instead of rendered empty
  - file: src/shared/components/status-table.spec.ts
    name: calls onRowClick with exactly the clicked row's data, not another row's
    proves: clicking a specific data row invokes the callback exactly once with that row's own data, not a neighboring row's
    fails_when: the callback fires zero or more than once, or is called with a different row's data than the one clicked
  - file: src/shared/components/status-table.spec.ts
    name: renders no anchor element for a clickable row
    proves: a row made interactive via onRowClick is not implemented as a link
    fails_when: a clickable row is rendered as or wrapped in an anchor element
  - file: src/shared/components/status-table.spec.ts
    name: activates onRowClick when Enter is pressed on the row
    proves: a clickable row responds to the Enter key by invoking the callback once with that row's data
    fails_when: Enter on a clickable row does not invoke the callback, or invokes it with the wrong data or wrong count
  - file: src/shared/components/status-table.spec.ts
    name: activates onRowClick when Space is pressed on the row
    proves: a clickable row responds to the Space key by invoking the callback once with that row's data
    fails_when: Space on a clickable row does not invoke the callback, or invokes it with the wrong data or wrong count
  - file: src/shared/components/status-table.spec.ts
    name: does not activate onRowClick for a key other than Enter or Space
    proves: keyboard activation is scoped to Enter and Space only, not every keydown
    fails_when: a key other than Enter or Space also triggers the callback
  - file: src/shared/components/status-table.spec.ts
    name: gives a row with no onRowClick neither an interactive role nor a tab stop
    proves: a row with no click handler carries no interactive ARIA role and no tabindex, so it is not exposed as interactive when it is not
    fails_when: an inert row is given a role attribute or a tabindex despite having no onRowClick
  - file: src/shared/components/status-table.spec.ts
    name: renders a status cell's color indicator together with its label
    proves: a cell value carrying both a color and a label renders the label as text and renders a color indicator element bearing that color class alongside it
    fails_when: the label is missing, or no element carrying the given color class is present in the cell
  - file: src/shared/components/status-table.spec.ts
    name: never renders a color indicator for a value carrying only a color and no label
    proves: a color alone, without a label, does not produce a color-indicator element anywhere in the table
    fails_when: an element carrying the given color class is rendered despite no label being present
  - file: src/shared/components/status-table.spec.ts
    name: renders a plain, non-status cell value as itself with no color indicator
    proves: a plain scalar cell value (not a color/label status object) renders as its own text content, with the status-rendering path not engaged
    fails_when: the plain value's text does not match what was given, e.g. because the status-rendering branch coerces or wraps it differently
not_applicable:
  - edge_case: duplicate rows or duplicate column keys
    why: StatusTableRow and StatusTableColumn are given as plain data by the caller; the component does not claim uniqueness over either, so there is no uniqueness invariant here to violate
  - edge_case: concurrent operations against one subject
    why: StatusTable is a pure, synchronous render with no async state, no shared mutable subject and no dependency call -- there is no concurrency edge for this component to exhibit
  - edge_case: a dependency that fails or answers slowly
    why: StatusTable takes no async dependency (no fetch, no promise prop); nothing here can fail or answer slowly
divergences:
  - cites: TST-01
    file: src/shared/components/status-table.spec.ts
    departure: >-
      Two tests ("renders a status cell's color indicator together with its label" and "never
      renders a color indicator for a value carrying only a color and no label") query the rendered
      container directly (a disclosed eslint-disable-next-line testing-library/no-node-access on
      each) rather than through a Testing Library role/text/label query alone.
    why: >-
      The color indicator is aria-hidden="true" by design (decorative -- the label beside it already
      carries the same information as text, per this app's own color-and-word rule), which excludes
      it from the accessibility tree entirely. No Testing Library query -- role, text, or label --
      can find an aria-hidden node, present or absent, so no query-based assertion could distinguish
      the passing case from the failing one for either test; a direct query is the only way either
      assertion can be stated at all. Both lines carry the disabling comment naming the rule and this
      reasoning inline, per PRH-03.
---

## What it is
Twelve tests exercising StatusTable's rendered output for real over jsdom, written after `test.environment: "jsdom"` and `test.globals: true` were authorized and wired.

## Notes
Row role discovery: a clickable row is exposed with `role="button"` (StatusTable's own choice, to expose it as interactive), not the table's implicit `role="row"` -- so clickable-row tests query `getAllByRole("button")`, while the one inert-row test queries `getAllByRole("row")`, matching what each row actually renders as.
