---
title: The error-code mapping keys on CaseVersionNotValidError — proof
summary: Tests hold uiStateForApiError, useCaseCurrentVersionValidity and CaseDetailScreen's Versions
  panel to the six criteria over the wire code the backend actually sends, and exclude the one admitted
  implementation the task's Notes name as underdetermined.
implementation: sha256:af0c4fd3333e396133392d5c38a7ab34ba9ee06d0fc4a653caf7bcc2ae3e1e9c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/case-not-valid-error-code-error-code-mapping-keys-on-the-current-name-suite
tests:
- file: src/services/error-ui-state.spec.ts
  name: resolves CaseVersionNotValidError, the name the backend's refusal actually carries, to its own
    distinct case-not-valid state, not the shared generic-error fallback
  proves: Criterion 1 — An API error whose code is CaseVersionNotValidError resolves through the frontend's
    error-code mapping to the case-not-valid user-facing state, and not to the state the surface shows
    for a read that did not complete.
  fails_when: UI_STATE_BY_ERROR_CODE stops mapping the literal key CaseVersionNotValidError to kind case-not-valid
    — reverted to the retired key, removed outright, or remapped to another kind — so uiStateForApiError
    returns GENERIC_ERROR_STATE or a different kind for this code instead.
- file: src/services/error-ui-state.spec.ts
  name: resolves CaseNotValidError, the retired name the mapping no longer keys on, to the shared generic-error
    state rather than case-not-valid
  proves: The implementation record's recorded inference — the wire code the mapping must key on is exactly
    CaseVersionNotValidError, with no dual mapping kept for the retired CaseNotValidError name.
  fails_when: the mapping table is changed to also carry, or restore, a CaseNotValidError entry resolving
    to kind case-not-valid, so the retired name resolves the same way as the real wire code instead of
    falling through to the generic state.
- file: src/services/error-ui-state.spec.ts
  name: resolves a code the table does not name to the generic-error state rather than throwing
  proves: Criterion 2, the resolution half — an API error whose code the mapping holds no presentation
    of its own for resolves to the state the surface shows for a read that did not complete.
  fails_when: an unrecognized code throws, or resolves to any kind other than generic-error. Pre-existing
    and unchanged by this delivery; included because it is what still proves this half of criterion 2.
- file: src/hooks/use-case-current-version-validity.spec.ts
  name: resolves to phase "not-valid", carrying the failing version's own number, when reading it as a
    case is refused
  proves: Criterion 1, at the hook layer — the real wire code resolves to phase not-valid rather than
    read-failed.
  fails_when: the hook reports phase read-failed, or anything other than not-valid at version 4, for a
    CaseVersionNotValidError refusal on the current version's own read — exactly what happened before
    this delivery, when the mapping still keyed on the retired name.
- file: src/hooks/use-case-current-version-validity.spec.ts
  name: reads the case's highest-numbered version, never the lower-numbered draft, to decide the outcome
  proves: Criterion 1 combined with the hook's highest-numbered-version selection, exercised with the
    real wire code.
  fails_when: the hook reports phase read-failed instead of not-valid for version 5's CaseVersionNotValidError
    refusal, or resolves against the lower-numbered draft instead.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: renders the current-version statement when reading the case's only version as a case fails validation
  proves: Criterion 3 — a case-keyed surface that meets a CaseVersionNotValidError refusal for the case's
    current version states that the case's current version does not read back as a case.
  fails_when: the screen renders READ_FAILED_TEXT or NO_VERSION_TEXT instead of NOT_VALID_TEXT for a CaseVersionNotValidError
    refusal on the case's only version — the exact regression this task corrects.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: renders the current-version statement for the case's highest-numbered version, never for a lower-numbered
    draft also on file
  proves: Criterion 3, combined with correct version selection, at the screen level.
  fails_when: the highest-numbered version's CaseVersionNotValidError refusal fails to render NOT_VALID_TEXT,
    or the version-list row count is wrong.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: renders the version-list table's rows unchanged alongside the current-version statement, never
    instead of it
  proves: Criterion 3 together with the alongside-never-instead-of half of criterion 4.
  fails_when: NOT_VALID_TEXT fails to render for the real wire code, or the version-list table is suppressed
    or altered when it does render.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: renders the read-did-not-complete statement, not the current-version statement, when the current
    version's own read fails for any other reason
  proves: Criterion 4 — the read-that-did-not-complete statement is distinct from the not-valid statement.
  fails_when: an unrecognized-code failure renders NOT_VALID_TEXT, or fails to render READ_FAILED_TEXT.
    Pre-existing and unchanged by this delivery; included because it is one of the three statements criterion
    4 requires stay distinct.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: renders only the no-version statement, neither the current-version statement nor the read-did-not-complete
    statement
  proves: Criterion 4 — the no-version statement is distinct from the other two.
  fails_when: an empty version list renders NOT_VALID_TEXT or READ_FAILED_TEXT instead of, or alongside,
    NO_VERSION_TEXT. Pre-existing and unchanged by this delivery; included for the same reason as the
    test above.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: renders only the fixed statement, never a field smuggled in the failing read's own error details
  proves: Criterion 5 — a case-keyed surface meeting a CaseVersionNotValidError refusal presents no attribute
    of the non-validating version as the case's current content.
  fails_when: any of SECRET-TITLE, SECRET-WHEN-TO-USE or SECRET-SUBJECT, carried in the refusal's own
    details, renders on the page alongside NOT_VALID_TEXT, or NOT_VALID_TEXT fails to render for the real
    wire code.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: renders neither statement once the case's highest-numbered version reads back as a case
  proves: Criterion 6 — a case whose current version reads back with every validator rule holding is presented
    with none of the not-valid statement.
  fails_when: NOT_VALID_TEXT or READ_FAILED_TEXT renders for a version whose read succeeds. Pre-existing
    and unchanged by this delivery; still what proves this criterion.
- file: src/routes/case-detail-screen-current-version-validity.spec.ts
  name: renders only the fixed did-not-complete statement, never an attribute of the case or its version,
    when the current version's own read fails with a code the mapping does not recognize
  proves: 'The task''s Notes, UNDERDETERMINED entry — the governing rule''s fuller text forbids stating
    any attribute of the case or of any version of it alongside the did-not-complete statement, a clause
    criterion 2 does not literally bound. This test fails over exactly the implementation the entry names:
    one where an unrecognized code resolves to the did-not-complete state while some attribute of the
    case or its version still reaches the render alongside it.'
  fails_when: any of SECRET-TITLE, SECRET-WHEN-TO-USE, SECRET-SUBJECT, SECRET-FALLBACK-OUTCOME, SECRET-CONSOLIDATION-REGISTER,
    SECRET-STATE or SECRET-MANIFEST-ENTRY renders on the page alongside READ_FAILED_TEXT, or READ_FAILED_TEXT
    fails to render for an unrecognized code.
not_applicable:
- edge_case: A boundary at each end of a stated range
  why: None of this task's six criteria states a bounded range — version numbers, statuses, or anything
    numeric — for the mapping or the surface to test against.
- edge_case: A duplicate where uniqueness is claimed
  why: No criterion of this task claims uniqueness over runtime values; the error-code table's own key
    uniqueness is a TypeScript object-literal property, not behavior these criteria state.
- edge_case: An operation against state that forbids it
  why: This task changes a read-side display mapping only; no criterion here names a forbidden state transition
    or a write the surface must refuse.
- edge_case: Two operations against one subject at once
  why: uiStateForApiError is a synchronous, side-effect-free lookup, and the surface only reads; nothing
    here is concurrent or mutates shared state for two operations to race over.
- edge_case: An absent or empty error code
  why: ApiError's own type requires code to be a string, always supplied by the API client from the wire
    envelope; no criterion of this task addresses a missing or empty code, and the existing unrecognized-code
    test already covers an arbitrary string resolving safely.
untested:
- 'The UNDERDETERMINED note''s fuller reading is proven here through an attribute-shaped value carried
  in the failing response''s own details payload, because that is the only concrete vehicle this component
  offers for such a value to reach the render today. Whether an attribute sourced from a genuinely separate
  mechanism — a stale react-query cache entry from an earlier successful read, surviving into the did-not-complete
  branch — would also stay excluded is not exercised: no code in case-detail-screen.tsx or its hooks reads
  case or version attributes from such a cache in this branch, so there is nothing existing for a test
  to point at without inventing the mechanism itself.'
---

## What it is
What proves the one-line correction: thirteen tests across the mapping, the hook and the screen, holding each of the task's six criteria to the wire code the backend actually sends.

## Notes
Three spec files the delivery found still stubbing the retired CaseNotValidError name were rewritten to the code the API answers with; that is a fixture stating a wire contract that does not exist, corrected, never an assertion weakened.
One test deliberately keeps the retired name and asserts it now falls through to the generic state, which is what pins the implementation's recorded inference that no dual mapping is kept.
One test answers the task's UNDERDETERMINED note rather than any criterion: it fails over exactly the implementation the note names, an unrecognised code reaching the did-not-complete statement with an attribute of the case rendered beside it.
The suite passed on its first capture, across all eight steps the registry declares.
