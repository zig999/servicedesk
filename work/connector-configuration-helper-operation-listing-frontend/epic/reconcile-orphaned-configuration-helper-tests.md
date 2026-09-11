---
title: Reconcile orphaned Configuration Helper specs from a closed initiative
summary: Three pre-existing spec files, delivered before this initiative, still drive the Configuration
  Helper through the free-text path/method inputs this initiative removed.
covers:
- domain/integration/openapi-operation
- domain/integration/openapi-document-operations
- rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing
- rules/integration/an-openapi-operations-method-is-upper-cased
- rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
uncovered:
- node: domain/integration/openapi-operation
  why: Already implemented by the sibling task operation-choice-fields, which built the Select these specs are rewritten to drive; this task changes no production code and asserts no new fact about the shape it offers.
- node: domain/integration/openapi-document-operations
  why: Same as above — the listing's shape is production code this task does not touch.
- node: rules/integration/an-openapi-operations-method-is-upper-cased
  why: The casing behavior is already implemented and tested by the sibling task operation-choice-fields; this task's criteria drive the specs through whatever entries the Select already offers rather than re-asserting their casing.
- node: rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
  why: Already implemented by an earlier, already-delivered task; the three specs already drive that surface, and this task's criteria preserve their existing assertions about it rather than establishing them.
sources:
- intake/orphaned-configuration-helper-tests.md
---

## What it is

The three spec files belong to `connector-configuration-openapi-helper`, a closed initiative — reopening it is refused, and none of the three is a file the trace binds anything to, so this is not the narrow corrective-increment route. It is ordinary evolution of this still-live plan: one new epic, one task, rewriting the three files' Configuration Helper interactions to choose from the Select `operation-choice-fields` already delivered.

## Notes

None.
