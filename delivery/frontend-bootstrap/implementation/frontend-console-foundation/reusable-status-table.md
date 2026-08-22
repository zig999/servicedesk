---
title: Reusable clickable-row status table
summary: StatusTable, composed over TUI's compound Table primitives, generic over columns/rows, rendering any {color,label} cell as both together and wiring a caller-supplied onRowClick to click and keyboard activation alike.
task: sha256:5adbf582f20f739c191f1778af1d427506d47661172e6f8e0068699895764ff6
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:154d391b6346febbd273d5806c95730da5db7e6ffa3df544a9792398002295e5
run: run/frontend-console-foundation-onda-1-full-suite-2
files:
  - path: src/shared/components/status-table.tsx
    effect: exports StatusTableColumn, StatusTableRow, StatusTableProps, the isStatusCellValue guard, renderCellContent, getRowKey and the StatusTable component, composed over @tui/ui/table's Table/TableHeader/TableBody/TableRow/TableHead/TableCell
criteria:
  - criterion: The table is composed over TUI's Table/TableHeader/TableBody/TableRow/TableHead/TableCell primitives rather than new markup.
    met: true
    how: StatusTable's JSX renders exclusively through the imported Table/TableHeader/TableBody/TableRow/TableHead/TableCell from "@tui/ui/table"; no bare table/tr/td markup appears anywhere in the file
  - criterion: Clicking a row triggers a caller-supplied navigation callback, not a hand-rolled anchor per row.
    met: true
    how: 'each TableRow''s onClick is wired to `onRowClick ? () => onRowClick(row) : undefined`, invoking the caller-supplied prop with that row''s data; no anchor element exists per row, and a row without onRowClick renders inert'
  - criterion: Any status value rendered in the status column carries both a color and a word, never color alone or word alone.
    met: true
    how: isStatusCellValue narrows a cell's value to {color,label} only when both are present; renderCellContent is the only path rendering such a value and always emits the colored dot and the label together in one span -- any other value falls through to renderPlainValue, which never emits a color
  - criterion: The component takes its columns and rows as data rather than hard-coding Cases, Glossary or Capabilities-specific fields.
    met: true
    how: StatusTableColumn ({key,header}) and StatusTableRow (Record<string, unknown>) are fully generic; the component reads cell values only via row[column.key], with no field name specific to any one screen
inferences:
  - inferred: row keyboard handling (onKeyDown triggering onRowClick on Enter or Space) goes beyond what the four criteria explicitly ask, since a keyboard-focusable role="button" row without a matching key handler would be an accessibility defect on the exact interaction the criteria describe.
    from: the row being given an interactive ARIA role and a tab stop (role="button", tabIndex=0) whenever onRowClick is supplied -- the navigation behavior and its target stay entirely caller-supplied, nothing here is a business fact added
divergences:
  - cites: TYP-02
    file: src/shared/components/status-table.tsx
    departure: this project's eslint.config.js applies @typescript-eslint/consistent-type-assertions as a blanket flag on every `as` assertion, including the guarded narrowing cast inside isStatusCellValue (value as Record<string, unknown>, reached only after the function already confirmed typeof value === "object" && value !== null) -- TYP-02 itself forbids only an assertion used without an accompanying guard, so this line does not violate the rule's own statement even though the lint step reports it as an error.
    why: no stock ESLint rule can read across a preceding if to confirm a guard accompanies a given assertion, so the tool-decided approximation is the stricter blanket flag on every `as`; the disable comment (itself required by PRH-03 to state why) applies this already-established, already-disclosed divergence at this specific line
preserved:
  - no screen consumes StatusTable yet in this increment, so no existing caller behavior was at risk from this delivery
---

## What it is
The reusable clickable-row, color-plus-word-status table the scope asks for, composed over TUI's compound Table primitive so Cases List, Glossary and Capabilities can share it in later waves.

## Notes
None.
