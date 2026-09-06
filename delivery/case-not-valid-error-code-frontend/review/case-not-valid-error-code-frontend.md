---
title: Review — the error-code mapping keys on the name the refusal now carries
summary: Coverage, specification-conformance, standard-conformance and failures passes over the case-not-valid-error-code-frontend
  initiative's one delivered task.
reviewed:
- src/services/error-ui-state.ts
- src/services/error-ui-state.spec.ts
- src/hooks/use-case-current-version-validity.spec.ts
- src/routes/case-detail-screen-current-version-validity.spec.ts
tasks:
- task/case-not-valid-error-code/error-code-mapping-keys-on-the-current-name
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/case-not-valid-error-code-frontend) passed in full across all eight steps
    the registry declares; there was no failure to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
reconciliation: siegard-reconcile/case-not-valid-error-code-frontend.md
coverage:
- criterion: An API error whose code is CaseVersionNotValidError resolves through the frontend's error-code
    mapping to the case-not-valid user-facing state, and not to the state the surface shows for a read
    that did not complete.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseVersionNotValidError, the name the backend's refusal actually carries, to its own
      distinct case-not-valid state, not the shared generic-error fallback
  - file: src/hooks/use-case-current-version-validity.spec.ts
    name: resolves to phase "not-valid", carrying the failing version's own number, when reading it as
      a case is refused
  - file: src/routes/case-detail-screen-current-version-validity.spec.ts
    name: renders the current-version statement when reading the case's only version as a case fails validation
- criterion: An API error whose code the frontend's mapping holds no presentation of its own for resolves
    to the state the surface shows for a read that did not complete, and the surface discloses neither
    that error code, nor the refusal's own message, nor any value the refusal carries.
  state: partial
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves a code the table does not name to the generic-error state rather than throwing
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseNotValidError, the retired name the mapping no longer keys on, to the shared generic-error
      state rather than case-not-valid
  - file: src/routes/case-detail-screen-current-version-validity.spec.ts
    name: renders only the fixed did-not-complete statement, never an attribute of the case or its version,
      when the current version's own read fails with a code the mapping does not recognize
  why: 'The resolution half is exercised: an unnamed code and the retired CaseNotValidError both resolve
    to generic-error, and the screen shows the did-not-complete statement for an unrecognized code. The
    non-disclosure half is only partly exercised. The screen test asserts that seven values carried in
    the refusal''s details are absent, but nothing asserts that the error code itself is absent from the
    surface, and nothing asserts that the refusal''s own message is absent — in that fixture message is
    set equal to the code, and neither string is queried. findByText(READ_FAILED_TEXT) is an exact single-node
    match, so it keeps passing while the code or the message is rendered anywhere else on the page. At
    the mapping level, the one test asserting a state carries no wording of its own is written over ConceptDescriptionRequiredError,
    a mapped code, never over an unmapped one, so a fallback state that attached the refusal''s message
    would pass every test here.'
- criterion: A case-keyed surface that meets a CaseVersionNotValidError refusal for the case's current
    version states that the case's current version does not read back as a case.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-current-version-validity.spec.ts
    name: renders the current-version statement when reading the case's only version as a case fails validation
  - file: src/routes/case-detail-screen-current-version-validity.spec.ts
    name: renders the current-version statement for the case's highest-numbered version, never for a lower-numbered
      draft also on file
  - file: src/routes/case-detail-screen-current-version-validity.spec.ts
    name: renders the version-list table's rows unchanged alongside the current-version statement, never
      instead of it
  - file: src/routes/case-detail-screen-current-version-validity.spec.ts
    name: renders only the fixed statement, never a field smuggled in the failing read's own error details
  - file: src/hooks/use-case-current-version-validity.spec.ts
    name: reads the case's highest-numbered version, never the lower-numbered draft, to decide the outcome
- criterion: What a case-keyed surface states for a current version that fails validation, what it states
    for a read of that case that did not complete, and what it states for a case currently holding no
    version are three statements, no two of which are presented alike.
  state: partial
  tests:
  - file: src/routes/case-detail-screen-current-version-validity.spec.ts
    name: renders the current-version statement when reading the case's only version as a case fails validation
  - file: src/routes/case-detail-screen-current-version-validity.spec.ts
    name: renders the read-did-not-complete statement, not the current-version statement, when the current
      version's own read fails for any other reason
  - file: src/routes/case-detail-screen-current-version-validity.spec.ts
    name: renders only the no-version statement, neither the current-version statement nor the read-did-not-complete
      statement
  why: 'The three statements are held to distinct wording and to mutual exclusivity: each test asserts
    one text present and queries the others absent, so collapsing any two of the three strings into one
    would fail. What is unexercised is everything in "presented alike" beyond the words. No test reads
    the role, severity, placement or container of the three statements, so an implementation rendering
    all three through one identical presentation — same alert element, same styling, same position, differing
    only in the sentence — passes every test in the set. The criterion''s "presented alike" is also ambiguous
    as stated: it can be read as wording alone, which is proven, or as presentation in the wider sense,
    which is not, and the audit does not settle which was meant. Two smaller gaps sit inside the exercised
    half: the read-did-not-complete test does not query the no-version statement absent, so those two
    are never held apart in that direction, and only one of the three read-failure paths produces the
    did-not-complete statement in this set.'
- criterion: A case-keyed surface meeting a CaseVersionNotValidError refusal presents no attribute of
    the non-validating version — its title, when_to_use, subject, fallback, consolidation_register, state
    or manifest, nor anything derived from them — as the case's current content.
  state: partial
  tests:
  - file: src/routes/case-detail-screen-current-version-validity.spec.ts
    name: renders only the fixed statement, never a field smuggled in the failing read's own error details
  why: 'Under a CaseVersionNotValidError refusal only three of the seven named attributes are exercised
    — title, when_to_use and subject are seeded into the refusal''s details and queried absent. Nothing
    submits fallback, consolidation_register, state or manifest under a CaseVersionNotValidError refusal,
    so a surface that read error.details.manifest, error.details.fallback, error.details.state or error.details.consolidation_register
    onto the page as the case''s current content passes every test here. The one test that does seed all
    seven is written over SomeUnrecognizedError, a different refusal on a different branch, and so proves
    nothing about this one. "Nor anything derived from them" is unexercised entirely: every assertion
    is an exact-text query for a seeded literal, so a count, a summary, a truncation or any other value
    computed from an attribute would be invisible to the set.'
- criterion: A case whose current version reads back with every validator rule holding is presented with
    none of the statement that its current version does not read back as a case.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-current-version-validity.spec.ts
    name: renders neither statement once the case's highest-numbered version reads back as a case
  - file: src/hooks/use-case-current-version-validity.spec.ts
    name: resolves to phase "valid" once the highest-numbered version reads back as a case
findings:
- pass: conformance
  file: src/routes/case-detail-screen-current-version-validity.spec.ts
  where: the errorResponse helper's default status, line 15, applied at lines 28, 47 and 63, and stated
    explicitly again at line 151
  evidence: 'function errorResponse(code: string, status = 422, details?: unknown): Response { ... [versionDetailPath(2)]:
    () => errorResponse("CaseVersionNotValidError"),'
  cost: the fixture is the one place in this file that fixes what status code a CaseVersionNotValidError
    refusal carries at read, and it fixes it at 422 — a reader consulting this test to learn the wire
    contract for this refusal, rather than the node, takes away the wrong status, even though the mapping
    under test, uiStateForApiError, never branches on it
  correction: mock the CaseVersionNotValidError refusal at 409, for example errorResponse("CaseVersionNotValidError",
    409)
- pass: conformance
  file: src/hooks/use-case-current-version-validity.spec.ts
  where: the errorResponse helper's default status, used unmodified at the versionPath(4) and versionPath(5)
    stubs, lines 18-20 and 52 and 74
  evidence: 'function errorResponse(code: string, status = 422): Response { return new Response(JSON.stringify({
    error: { code, message: code } }), { status }); } ... [versionPath(4)]: () => errorResponse("CaseVersionNotValidError"),'
  cost: The fixture models a CaseVersionNotValidError refusal as arriving at HTTP 422 in both the criterion-1
    and criterion-2 tests, while the node reserves 422 for a well-formed write violating an invariant
    and fixes this one at 409. A reader taking this spec file as the shape of the wire contract, the only
    place in this file that models the refusal at all, learns the wrong status, and nothing else in the
    file corrects it.
  correction: Pass status 409 to errorResponse at both call sites simulating CaseVersionNotValidError,
    versionPath(4) and versionPath(5)
- pass: standard
  cites: TST-02
  file: src/services/error-ui-state.spec.ts
  where: line 6, the outer describe block
  evidence: describe("uiStateForApiError", () => {
  cost: A failing run's output shows "uiStateForApiError > resolves CaseVersionNotValidError..." — the
    group label itself tells the reader nothing beyond the function's own name, where the other two spec
    files in this change both pair the unit's name with an explicit behavior clause so a reader can tell
    what broke from the group label alone.
  correction: Rename the describe block to state the behavior the mapping establishes, the same way the
    other two spec files in this set pair the unit under test with a behavior clause.
---

## What it is
The review of the case-not-valid-error-code-frontend initiative's one task: whether its tests prove its criteria, whether its source states only what the specification holds, whether it follows the project's own standard, and why the captured run failed — it did not.

## Notes
Three findings, and the two from the conformance pass are one defect in two files: both spec files inherited a 422 default in their errorResponse helper and never overrode it for the CaseVersionNotValidError stubs, while the node fixes that refusal at 409.
Neither is a behavioural defect — the frontend keys only on the error code and on response.ok, never on the numeric status, which is why the suite passes over the wrong one — but each fixture is the only description of the wire contract in its own file, and it describes it wrongly.
That is the same class of staleness this whole initiative corrects, arriving one layer down: a fixture asserting a contract the backend does not serve.
Three coverage entries came back partial, and each names an implementation that would pass every test while breaking the criterion: a fallback state that attached the refusal's own message, three statements rendered through one identical presentation differing only in wording, and a surface reading four of the seven prohibited attributes that no test seeds under this refusal.
The conformance pass cleared 9 of the 10 node-file pairs it read and restamped them; the one it did not is rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name, held by the two status findings above.
The bind left 8 sibling bindings stale on files outside this review, all carried forward from earlier binds elsewhere in the frontend tree.
