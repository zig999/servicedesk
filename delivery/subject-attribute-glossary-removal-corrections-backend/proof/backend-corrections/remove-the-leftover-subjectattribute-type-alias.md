---
target: backend
title: Proof for removing the leftover SubjectAttribute type alias
summary: Confirms terms.ts's remaining exports are unchanged via the pre-existing terms.spec.ts test,
  and records why the type-alias-absence and import-absence criteria admit no runtime test.
implementation: sha256:11813c1a1a8ffee7542ddc49bccb7fd57ba2f3d0fdb916118c4ca6e977277779
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/backend-corrections-suite-2
tests:
- file: src/__tests__/unit/glossary/terms.spec.ts
  name: lists exactly the four term vocabularies subject-type, outcome, action and recipient, in that
    order, holding no fifth entry
  proves: TERM_VOCABULARIES and every other export of terms.ts are unchanged.
  fails_when: TERM_VOCABULARIES's value, order or count changes
not_applicable:
- edge_case: any runtime code path depending on the removed SubjectAttribute type
  why: a TypeScript type alias is erased at compile time and was never a value any runtime path could
    read; a word-bounded search for the identifier across src/ returns zero occurrences
untested:
- terms.ts no longer declares or exports a SubjectAttribute type -- a type alias's absence is a fact of
  TypeScript's type layer, erased before anything runs; only tsc decides it.
- No file in src/ imports SubjectAttribute from terms.ts -- same compile-time reasoning; a repository-wide
  search found no occurrence, but a search is not a behavioral test.
- TERM_VOCABULARIES and every other export of terms.ts are unchanged -- beyond TERM_VOCABULARIES's own
  value, the rest of terms.ts's exports are pure types (untestable at runtime) or untouched runtime constants
  exercised by the pre-existing wider suite.
- src's test suite passes -- a property of the whole run, answered by the captured run, not by a single
  test.
---

## What it is

See summary.

## Notes

None.
