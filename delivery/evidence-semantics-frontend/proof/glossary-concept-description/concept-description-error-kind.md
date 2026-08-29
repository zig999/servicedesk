---
title: Proof for the concept-description-required UiErrorState kind
summary: Two new tests in the existing error-ui-state.spec.ts, in the same per-entry style already used for every prior single-entry addition, prove the new table entry resolves to its own distinct kind and carries no wording; the third criterion is already proven by the untouched pre-existing suite.
implementation: sha256:44d9e75d17b568d579c074c380030d326a25aa7a651b42bbc7344d558e3ab1ac
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/glossary-concept-description-concept-description-error-kind-suite
tests:
- file: src/services/error-ui-state.spec.ts
  name: resolves ConceptDescriptionRequiredError to its own distinct concept-description-required state, not the shared generic-error fallback
  proves: An ApiError whose code is ConceptDescriptionRequiredError maps to a named UiErrorState kind distinct from the generic failure kind.
  fails_when: uiStateForApiError returns anything other than kind === "concept-description-required" for that code — including if the entry were missing (falling through to generic-error), misspelled, or mapped to the same kind as the generic fallback.
- file: src/services/error-ui-state.spec.ts
  name: resolves ConceptDescriptionRequiredError to a state carrying only the kind, no wording of its own
  proves: The new table entry carries no user-facing wording.
  fails_when: the resolved state carries any property besides kind (e.g. a message, label or wording field added to the entry), or the returned object were missing kind entirely.
untested:
- Every ApiError code the table already names keeps mapping to its existing kind — proven not by a new test but by the pre-existing, untouched suite in the same file, which still exercises every prior code against the same table; the implementation record confirms no existing key, value or comment was altered.
not_applicable:
- edge_case: The entry's placement inside the table's 422-appropriate comment-delimited group.
  why: Source ordering and comment placement are not observable behavior — uiStateForApiError is a plain-object lookup where iteration order carries no meaning, so no test over the function's return value could distinguish this placement from any other.
- edge_case: The module header comment's key count being updated from nineteen to twenty.
  why: A comment is not observable behavior a caller of uiStateForApiError can see; nothing a test invokes reads or returns comment text.
- edge_case: Exhaustive distinctness of concept-description-required against all other kinds in the union, rather than only against generic-error.
  why: The criterion as written names distinctness from the generic failure kind specifically, and every prior single-entry addition in this same file tests exactly that scope, following the file's own established convention.
- edge_case: An unmapped/unknown ApiError code still falling through to generic-error, now that a twentieth entry exists.
  why: Already covered by the pre-existing, untouched test for that fallback path; this task's change does not alter it.
---

## What it is
Two tests extending the existing table's own test file, proving the new entry the same way every prior single-entry addition to this table was proven.

## Notes
None.
