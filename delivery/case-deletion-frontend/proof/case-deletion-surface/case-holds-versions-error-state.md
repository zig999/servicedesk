---
target: frontend
title: CaseHoldsVersionsError gets a distinct, non-generic UI error-state kind
summary: Proves that uiStateForApiError now answers CaseHoldsVersionsError with a kind of its own, distinct
  from every other code the map names (including case-not-found) and from the generic fallback, while
  the case-not-found and unnamed-code paths remain exactly as they answered before.
implementation: sha256:6de79550ac8a72561b212713c3041f79852ba69e110bbaca3944993f8d73a12b
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-deletion-surface-case-holds-versions-error-state-suite-2
tests:
- file: src/services/error-ui-state.spec.ts
  name: resolves CaseHoldsVersionsError to a kind no other named code resolves to, distinct from the generic
    fallback
  proves: Criterion "uiStateForApiError, given an ApiError whose code is CaseHoldsVersionsError, does
    not answer the generic error state"; criterion "The kind uiStateForApiError answers for CaseHoldsVersionsError
    is distinct from the case-not-found kind" (CaseNotFoundError is one of the enumerated other codes);
    and the task's UNDERDETERMINED entry, by refusing exactly the implementation it names -- mapping CaseHoldsVersionsError
    onto a kind an existing code already answers, which the enumeration of every other currently-named
    code catches regardless of which one it collides with. The test asserts only kind-distinctness, never
    the literal "case-holds-versions" itself, since no criterion or node names that literal and the implementation
    record holds it as an arrangement inference no test may pin.
  fails_when: CaseHoldsVersionsError's kind equals "generic-error", or equals the kind any other currently-named
    error code (CaseNotFoundError among them) already resolves to.
- file: src/services/error-ui-state.spec.ts
  name: resolves CaseNotFoundError to the case-not-found state
  proves: Criterion "uiStateForApiError, given an ApiError whose code is CaseNotFoundError, answers the
    case-not-found kind" -- a regression guard the task's own ADVISORY note flags, and this pre-existing
    test already states it whole; the implementation left this entry and this test untouched.
  fails_when: CaseNotFoundError stops resolving to the case-not-found kind.
- file: src/services/error-ui-state.spec.ts
  name: resolves a code the table does not name to the generic-error state rather than throwing
  proves: Criterion "uiStateForApiError, given an ApiError whose code no map entry names, answers the
    generic error state" -- the second regression guard the ADVISORY note flags, already stated whole
    by this pre-existing test; the lookup-then-?? fallback the implementation preserved is what this test
    exercises.
  fails_when: An error code absent from UI_STATE_BY_ERROR_CODE stops resolving to the generic-error kind
    (or the lookup throws instead of falling back).
not_applicable:
- edge_case: Two concurrent calls to uiStateForApiError racing against each other
  why: uiStateForApiError is a synchronous, side-effect-free lookup against a module-level constant object;
    no obligation here concerns shared mutable state or ordering between calls.
- edge_case: The mapped dependency (UI_STATE_BY_ERROR_CODE) failing or answering slowly
  why: The table is a compile-time literal, not a call to anything that can fail or be slow.
- edge_case: An empty-string or otherwise malformed error code
  why: Not a distinct class under either the criteria or the two nodes -- it is a code no map entry names,
    the same equivalence class already covered by the existing regression test.
- edge_case: A duplicate key in UI_STATE_BY_ERROR_CODE
  why: The table is a fixed object literal the implementation edits directly; TypeScript's own object-literal
    semantics leave nothing for a test to decide.
untested:
- 'rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete''s fact, whole, is
  not decided by any test reachable from error-ui-state.ts: the node requires the surface to state that
  the case still holds at least one case version, and to state that no case answers the slug, told apart
  from each other. This task supplies only the kind that lets a future surface tell those apart -- the
  wording itself is the task''s own REMAINDER, assigned to case-delete-refusal-presentation.'
- 'rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure''s
  fact, whole, is not decided by any test reachable from error-ui-state.ts: the node requires a surface
  to state an unrecognised-failure notice to the curator, distinguishable from the other two tellings,
  disclosing neither the code, the message, nor any carried value. This file only keeps the generic fallback
  available and distinguishable at the kind level; the actual telling this node requires is left to whatever
  task wires a delete surface''s presentation.'
---

## What it is
Unit tests over uiStateForApiError in src/services/error-ui-state.ts, one new test for CaseHoldsVersionsError's kind-distinctness and two pre-existing regression tests for CaseNotFoundError and the generic fallback.

## Notes
run/case-deletion-surface-case-holds-versions-error-state-suite failed at the lint step: error-ui-state.spec.ts exceeded the project's max-lines limit (300) once the new test was added. Cause: test (the file this delivery wrote to). Fixed by extracting shared construction/assertion helpers (stateFor, kindFor, expectDistinctKind) into the same file, with no test deleted, no assertion weakened and no test's proof narrowed; the suite then passed clean under -suite-2.
