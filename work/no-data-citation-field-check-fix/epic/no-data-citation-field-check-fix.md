---
title: No-data citation field-check fix
summary: 'A corrective increment: citesADeclaredField wrongly rejects a citation carrying no field.'
covers:
- domain/investigation/citation
- domain/investigation/evidence
- domain/knowledge/hypothesis-revision
- rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
- rules/investigation/a-citation-stays-within-the-hypothesis-collects
- rules/investigation/a-cited-field-exists-in-the-capability-output-schema
- rules/investigation/judgment-reads-the-evidence-snapshot
- scenarios/investigation/a-citation-names-a-nested-output-schema-field
- scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
uncovered:
- node: domain/investigation/evidence
  why: The trace's --encodes claim for citation-validation.ts binds this node because the file reads an
    evidence item's fields; this correction changes only how a fieldless citation is checked against those
    fields, never what evidence itself is or holds.
- node: domain/knowledge/hypothesis-revision
  why: Bound because the file's context type carries a hypothesis-revision's collects; this correction
    touches neither the collects check nor the revision itself.
- node: rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
  why: Governs what an observation's own fields may hold, upstream of this file; this correction does
    not change what a field list may contain, only how a fieldless citation is checked against it.
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  why: Governs citesACollectedConcept, the sibling check isCitationValid also runs; this correction changes
    only citesADeclaredField and leaves the collects check untouched.
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  why: Governs what a judgment may read from evidence at all; this correction does not change what is
    read, only whether a fieldless citation passes the existing field check.
- node: scenarios/investigation/a-citation-names-a-nested-output-schema-field
  why: Illustrates a citation naming a present, nested field; this correction concerns the case where
    no field is named at all, a different branch of the same function.
- node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
  why: Illustrates the snapshot-over-live-read discipline of judgment-reads-the-evidence-snapshot; unaffected
    by this correction.
---

## What it is

A corrective increment: `citesADeclaredField` in `src/investigation/citation-validation.ts`
unconditionally requires a cited field to be found among the cited evidence's own fields, so a
citation naming no field at all -- the no-data-verdict case -- is wrongly rejected instead of
accepted.

## Notes

Claim seeded mechanically from `trace.py --encodes src src/investigation/citation-validation.ts`,
per the corrective-increment route -- covers exactly what that command returned. Every node the
one task under this epic does not implement is declared in `uncovered` with a why, since this
correction reaches only citesADeclaredField's field-presence check.
