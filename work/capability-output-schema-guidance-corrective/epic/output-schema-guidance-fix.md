---
title: Output schema guidance fix
summary: 'Corrective increment: the Output schema field''s authoring surface renders
  no guidance paragraph at all, though the specification''s output-schema-entry rules
  already require one.'
rationale: One wrong behavior in already-delivered code, named by the human running
  the system for real (a pre-existing failing spec, capability-form-fields-output-schema-guidance.spec.ts)
  — a corrective increment, not a scope, so it gets its own epic claiming exactly
  what the binder returned for its one task.
sources:
- work/capability-output-schema-guidance-corrective/intake/wrong-behavior.md
covers:
- rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
- rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim
- rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
- rules/glossary/a-description-states-meaning-never-policy
- domain/investigation/field-semantics
- domain/integration/capability
---

## What it is
The single corrective task that renders the Output schema field's guidance paragraph on the capability create and detail screens.

## Notes
None.
