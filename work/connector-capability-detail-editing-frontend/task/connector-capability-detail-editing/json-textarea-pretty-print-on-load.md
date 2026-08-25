---
title: JSON textareas pretty-print their loaded value
summary: JsonTextareaField shows a valid loaded JSON value pretty-printed rather than minified, wherever it is used.
rationale: Cut as its own task because it is one presentational change at one shared component, changing for a different reason (formatting) than any hook or screen work, and independently demonstrable at the component level without either detail route existing — the scope itself names both the existing dialogs and the new routes as places this must hold, so it cannot be scoped inside either route task.
objective: A JSON textarea displays a pretty-printed rendering of a syntactically valid JSON value it is given, on mount and whenever a new value is loaded into it, without altering its existing invalid-JSON handling.
criteria:
  - Given a syntactically valid JSON value, the textarea's displayed text is pretty-printed rather than left in the minified form it was passed, immediately on mount.
  - Given a value that is not valid JSON, the textarea shows the value as-is, so the existing inline "Invalid JSON" error behavior is unchanged.
  - The configuration field in the connector-configuration create/edit dialog shows its loaded value pretty-printed.
  - The input_schema and output_schema fields in the capability create/edit dialog show their loaded values pretty-printed.
sources:
  - intake/scope.md
---

## What it is

This task changes JsonTextareaField (or the pure helper it already exposes for minifying) to pretty-print a valid loaded value on mount, so every caller — both existing dialogs and both new detail routes — gets the behavior without being touched itself.
It does not change the existing Beautify button, the inline error text, or the minify-on-save path.

## Notes

This task implements no specification node. It is a purely presentational change to how a shared component renders a value it already holds (pretty-print on mount versus minified), and none of the epic's candidate nodes state, constrain, or contradict anything about client-side JSON rendering — the well-formedness rules govern what the registry accepts on write, never how a valid value is displayed.
