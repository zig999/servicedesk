---
title: Proof for naming the not-draft release refusal in the error vocabulary
summary: Two new tests prove HypothesisRevisionNotDraftAtReleaseError resolves to its own exclusive UI-state kind, and twenty-one pre-existing tests already in the file establish that every previously-listed code and the unrecognized-code fallback are unchanged.
implementation: sha256:8ef88bcde46c1a29179e40929e59ffd0d98c65c63f36c1121ede846d85b98d32
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/hypothesis-revision-own-state-ui-name-the-not-draft-release-refusal-suite
tests:
- file: src/services/error-ui-state.spec.ts
  name: resolves HypothesisRevisionNotDraftAtReleaseError to the hypothesis-revision-not-draft-at-release state
  proves: 'Given an API error whose code is HypothesisRevisionNotDraftAtReleaseError, the error-to-UI-state resolution answers a kind exclusive to this error code -- resolved by no other code the table lists -- and distinguishable from the kind any unrecognized code falls back to. Also proves the implementation''s first recorded inference: the new kind''s exact string value is "hypothesis-revision-not-draft-at-release".'
  fails_when: uiStateForApiError stops returning kind "hypothesis-revision-not-draft-at-release" for this code, or returns any other string.
- file: src/services/error-ui-state.spec.ts
  name: resolves HypothesisRevisionNotDraftAtReleaseError to a kind no other listed code resolves to, distinct from the generic fallback
  proves: The exclusivity half of the same criterion -- that the new kind is resolved by no other of the twenty codes the table already lists, and is distinct from generic-error.
  fails_when: any of the twenty other listed codes resolves to "hypothesis-revision-not-draft-at-release", or HypothesisRevisionNotDraftAtReleaseError itself resolves to "generic-error".
- file: src/services/error-ui-state.spec.ts
  name: resolves CaseNotFoundError to the case-not-found state
  proves: Every other error code the table already lists resolves to the same kind it resolved to before.
  fails_when: this pre-existing entry stops resolving to kind "case-not-found".
- file: src/services/error-ui-state.spec.ts
  name: resolves ConceptNotAnsweredError to the concept-not-answered state
  proves: Every other error code the table already lists resolves to the same kind it resolved to before.
  fails_when: this pre-existing entry stops resolving to kind "concept-not-answered".
- file: src/services/error-ui-state.spec.ts
  name: resolves ConceptNotHeldError to the concept-not-held state
  proves: Every other error code the table already lists resolves to the same kind it resolved to before.
  fails_when: this pre-existing entry stops resolving to kind "concept-not-held".
- file: src/services/error-ui-state.spec.ts
  name: resolves VocabularyTermNotHeldError to the vocabulary-term-not-held state
  proves: Every other error code the table already lists resolves to the same kind it resolved to before.
  fails_when: this pre-existing entry stops resolving to kind "vocabulary-term-not-held".
- file: src/services/error-ui-state.spec.ts
  name: resolves CaseAlreadyHasDraftError to the case-already-has-draft state
  proves: Every other error code the table already lists resolves to the same kind it resolved to before.
  fails_when: this pre-existing entry stops resolving to kind "case-already-has-draft".
- file: src/services/error-ui-state.spec.ts
  name: resolves ManifestPositionOccupiedError to the manifest-position-occupied state
  proves: Every other error code the table already lists resolves to the same kind it resolved to before.
  fails_when: this pre-existing entry stops resolving to kind "manifest-position-occupied".
- file: src/services/error-ui-state.spec.ts
  name: resolves CaseVersionNotDraftError to the case-version-not-draft state
  proves: Every other error code the table already lists resolves to the same kind it resolved to before.
  fails_when: this pre-existing entry stops resolving to kind "case-version-not-draft".
- file: src/services/error-ui-state.spec.ts
  name: resolves CaseVersionNotDraftAtReleaseError to the case-version-not-draft-at-release state
  proves: Every other error code the table already lists resolves to the same kind it resolved to before. Also that the new entry, placed immediately beside this one in the table (the implementation's second recorded inference), left this sibling entry's own mapping untouched.
  fails_when: this pre-existing entry stops resolving to kind "case-version-not-draft-at-release".
- file: src/services/error-ui-state.spec.ts
  name: resolves CaseVersionNotReleasableError to the case-version-not-releasable state
  proves: Every other error code the table already lists resolves to the same kind it resolved to before.
  fails_when: this pre-existing entry stops resolving to kind "case-version-not-releasable".
- file: src/services/error-ui-state.spec.ts
  name: resolves ManifestWouldHoldNoHypothesisError to the manifest-would-hold-no-hypothesis state
  proves: Every other error code the table already lists resolves to the same kind it resolved to before.
  fails_when: this pre-existing entry stops resolving to kind "manifest-would-hold-no-hypothesis".
- file: src/services/error-ui-state.spec.ts
  name: resolves CaseHoldsNoDraftError to the shared generic-error state
  proves: Every other error code the table already lists resolves to the same kind it resolved to before.
  fails_when: this pre-existing entry stops resolving to kind "generic-error".
- file: src/services/error-ui-state.spec.ts
  name: resolves ConceptNotInGlossaryError to the shared generic-error state
  proves: Every other error code the table already lists resolves to the same kind it resolved to before.
  fails_when: this pre-existing entry stops resolving to kind "generic-error".
- file: src/services/error-ui-state.spec.ts
  name: resolves ConceptRefusesSubjectTypeError to the shared generic-error state
  proves: Every other error code the table already lists resolves to the same kind it resolved to before.
  fails_when: this pre-existing entry stops resolving to kind "generic-error".
- file: src/services/error-ui-state.spec.ts
  name: resolves CaseNotValidError to its own distinct case-not-valid state, no longer the shared generic-error fallback
  proves: Every other error code the table already lists resolves to the same kind it resolved to before.
  fails_when: this pre-existing entry stops resolving to kind "case-not-valid", or resolves to "generic-error" again.
- file: src/services/error-ui-state.spec.ts
  name: resolves ConceptAlreadyAnsweredError to the concept-already-answered state
  proves: Every other error code the table already lists resolves to the same kind it resolved to before.
  fails_when: this pre-existing entry stops resolving to kind "concept-already-answered".
- file: src/services/error-ui-state.spec.ts
  name: resolves IncompleteCapabilityContractError to the incomplete-capability-contract state
  proves: Every other error code the table already lists resolves to the same kind it resolved to before.
  fails_when: this pre-existing entry stops resolving to kind "incomplete-capability-contract".
- file: src/services/error-ui-state.spec.ts
  name: resolves CapabilityNotReadOnlyError to the capability-not-read-only state
  proves: Every other error code the table already lists resolves to the same kind it resolved to before.
  fails_when: this pre-existing entry stops resolving to kind "capability-not-read-only".
- file: src/services/error-ui-state.spec.ts
  name: resolves CapabilitySchemaNotWellFormedError to the capability-schema-not-well-formed state
  proves: Every other error code the table already lists resolves to the same kind it resolved to before.
  fails_when: this pre-existing entry stops resolving to kind "capability-schema-not-well-formed".
- file: src/services/error-ui-state.spec.ts
  name: resolves ConnectorConfigurationNotWellFormedError to its own distinct connector-configuration-not-well-formed state, not the shared generic-error fallback
  proves: Every other error code the table already lists resolves to the same kind it resolved to before.
  fails_when: this pre-existing entry stops resolving to kind "connector-configuration-not-well-formed".
- file: src/services/error-ui-state.spec.ts
  name: resolves ConceptDescriptionRequiredError to its own distinct concept-description-required state, not the shared generic-error fallback
  proves: Every other error code the table already lists resolves to the same kind it resolved to before.
  fails_when: this pre-existing entry stops resolving to kind "concept-description-required".
- file: src/services/error-ui-state.spec.ts
  name: resolves a code the table does not name to the generic-error state rather than throwing
  proves: An error code the table does not list still resolves to the generic kind.
  fails_when: uiStateForApiError throws for an unrecognized code, or returns anything other than kind "generic-error".
not_applicable:
- edge_case: an empty-string or absent ApiError.code
  why: an empty string or undefined is not one of the table's twenty-one named keys, so it takes the exact same lookup-miss path already exercised by "resolves a code the table does not name to the generic-error state rather than throwing"; a second test over a different unnamed value would fail for the identical reason and prove nothing that test does not already.
- edge_case: two calls to uiStateForApiError at once, or concurrent code paths reading the table
  why: uiStateForApiError is a pure, synchronous object lookup with no shared mutable state, no I/O and no async boundary -- there is no operation here two callers could interleave.
- edge_case: a dependency that fails or answers slowly
  why: uiStateForApiError calls no dependency -- it reads one in-memory table -- so there is nothing here that can fail or be slow.
- edge_case: a duplicate key in the lookup table (HypothesisRevisionNotDraftAtReleaseError declared twice, or colliding with an existing key)
  why: the table is a single object literal; a duplicate key is a source-level collision the file itself could not contain twice under this exact name without one silently overwriting the other at parse time, not a runtime input this test can construct through the public function -- and the implementation record states no other key was touched.
untested:
- 'That kind is declared as a member of the module''s UI error-state kind union (criterion 2): this is a fact about the TypeScript type UiErrorStateKind, not about any runtime value uiStateForApiError returns. Vitest''s own transform (esbuild) strips types without checking them, so a test asserting a literal against itself compiles and passes under `npm test` whether or not the string is actually a member of the union -- it would occupy the place a real test would go without ever being able to fail one it should. What actually enforces this criterion is the project''s own strict typecheck step (TYP-01, decided by a tool, run as `npm run typecheck`): UI_STATE_BY_ERROR_CODE''s own type annotation means tsc refuses to compile the table entry at all if "hypothesis-revision-not-draft-at-release" were not declared in the union. No test in this file can independently reproduce that check without becoming the vacuous kind the proof is required to avoid.'
- 'The implementation''s second recorded inference -- that the new table entry sits immediately beside CaseVersionNotDraftAtReleaseError rather than elsewhere in the object literal: this is source arrangement, not something uiStateForApiError''s return value can reveal, since a flat key lookup answers identically regardless of where its key sits in the literal. No test here distinguishes this placement from the same entry declared anywhere else in the table.'
---
## What it is

Two new tests prove the criteria this task adds; twenty-one pre-existing tests in the same file already establish every other code's mapping and the unrecognized-code fallback are unchanged.
Criterion 2 (the type-union membership) is left to the project's own typecheck step rather than a vacuous runtime assertion.

## Notes

None.
