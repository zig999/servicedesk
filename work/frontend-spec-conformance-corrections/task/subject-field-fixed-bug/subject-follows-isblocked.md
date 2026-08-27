---
title: Subject field honors isBlocked like every other declared attribute
summary: case-version-editor-form-fields.tsx's subject field is editable while a draft is not blocked, and its label stops asserting the field is fixed.
objective: A curator viewing a draft case version's editor can correct the subject field the same way they correct title, when_to_use, fallback and consolidation_register — disabled only when the version is blocked (saving, in conflict, or released), never unconditionally.
criteria:
  - Given a draft case version whose form is not blocked (not saving, not in conflict, not released), the subject field's input is enabled.
  - Given a case version whose form is blocked (isBlocked is true, for any of its stated reasons), the subject field's input is disabled, the same as every other declared-attribute field.
  - The subject field's label no longer states or implies that the field is fixed.
rationale: A corrective increment answering to no criterion any task holds — the divergence was found by siegard-reconcile/frontend-case-version-subject-field-drift.md's judgment over case-version-editor-form-fields.tsx, reconciling delivered code against the specification rather than any task's own criteria. The file's own header comment traces the original "fixed/disabled" choice to a layout reference (proposal §2.3) rather than to any specification node — a fact only a reference held, which the specification does not support.
implements:
  - domain/knowledge/case-version
sources:
  - intake/2026-08-27-subject-field-fixed-bug.md
---

## What it is

A corrective increment: one wrong behavior observed by reconciling delivered code against the specification, answering to no criterion of any task under this initiative's own plan.

## Notes

None.
