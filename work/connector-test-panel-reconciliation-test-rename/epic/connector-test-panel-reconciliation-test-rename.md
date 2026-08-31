---
title: Reconcile the attribute tie-break test with the now-read-only Attribute field
summary: The reconciliation tie-break test that renamed a row's Attribute field through the UI
  is rewritten to induce the same collision through Configuration's own text instead.
sources:
- intake/scope.md
covers:
- domain/investigation/subject-attribute-value
- domain/glossary/subject-attribute
- rules/integration/an-http-connector-configuration-declares-its-call
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
- rules/investigation/a-subject-holds-one-value-per-attribute
uncovered:
- node: domain/glossary/subject-attribute
  why: The execution-contract-binder read this fresh and found it declares only the vocabulary
    construct (one value object whose sole attribute is a name); this epic's one task reuses one
    attribute name twice and never exercises the vocabulary or a name's membership in it.
---

## What it is
Fixes one currently-failing test, broken as the legitimate consequence of another already-delivered corrective task making the Test Panel's Attribute field non-editable: the test's own mechanism for inducing a duplicate-attribute-name scenario (renaming through the UI) is replaced with one that edits Configuration's text instead, leaving the tie-break behavior under test, and every other test in the file, unchanged.

## Notes
None.
