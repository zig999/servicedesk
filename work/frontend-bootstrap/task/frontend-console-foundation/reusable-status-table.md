---
title: Reusable clickable-row status table
summary: A reusable table with a clickable row and a status column always rendered as color plus word, composed over TUI's Table primitive, for reuse by Cases List, Glossary and Capabilities.
rationale: >-
  Kept as its own task because the reusable status table is one component with one reason to
  change -- its row/column/status contract -- independent of the shell, the client, the error
  table and every other reusable piece this wave builds; no screen consuming it exists yet in
  this increment. The binder confirmed no candidate governs this task: the status column is a
  generic, data-driven shape, not the case/case-version lifecycle status vocabulary those later
  screens will supply.
objective: A reusable table component renders rows that navigate on click and a status column always paired with both a color and a word, composed over TUI's Table primitive rather than new table markup.
criteria:
  - The table is composed over TUI's Table/TableHeader/TableBody/TableRow/TableHead/TableCell primitives rather than new markup.
  - Clicking a row triggers a caller-supplied navigation callback, not a hand-rolled anchor per row.
  - Any status value rendered in the status column carries both a color and a word, never color alone or word alone.
  - The component takes its columns and rows as data rather than hard-coding Cases, Glossary or Capabilities-specific fields.
sources:
  - intake/onda-1-scope.md
---

## What it is
The reusable clickable-row, color-plus-word-status table the scope asks for, composed over TUI's compound Table primitive so Cases List, Glossary and Capabilities can share it in later waves.

## Notes
None.
