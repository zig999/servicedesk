---
target: backend
title: Fieldless citation acceptance in citesADeclaredField
summary: Two new unit tests cover a fieldless citation being accepted whatever fields its cited evidence
  item snapshotted, and the pre-existing field-mismatch test continues to cover a named-field citation's
  refusal; the verdict-conditioned half of both cited nodes remains outside what isCitationValid's signature
  can decide and is left unproven.
implementation: sha256:1828ed04fea14101acb0d23a46f9ce4130797e7341c76c61b60f90c7abd1b02d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/no-data-citation-field-check-fix-fieldless-citation-accepted-suite
tests:
- file: src/__tests__/unit/investigation/citation-validation.spec.ts
  name: accepts a citation naming a collected concept and carrying no field, when its own cited evidence
    item snapshotted no fields at all -- the no-data-verdict case
  proves: Criterion 1, for the case where the cited evidence item's own snapshot is empty -- the classic
    no-data-verdict shape.
  fails_when: isCitationValid rejects a fieldless citation whose cited evidence item's own fields array
    is empty -- e.g. if citesADeclaredField still fell through to fields.some(...) instead of returning
    true as soon as citation.field is undefined.
- file: src/__tests__/unit/investigation/citation-validation.spec.ts
  name: accepts a citation naming a collected concept and carrying no field even where its own cited evidence
    item snapshotted one or more fields -- fieldless acceptance holds whatever field names that item snapshotted
  proves: Criterion 1's own qualifier, "whatever field names the cited evidence item snapshotted" -- that
    fieldless acceptance does not depend on the cited item actually having zero snapshotted fields.
  fails_when: isCitationValid rejects a fieldless citation whenever its cited evidence item happens to
    carry declared fields -- e.g. an alternate fix that special-cases citedEvidence.fields.length ===
    0 instead of citation.field === undefined would pass the first test above and fail this one.
- file: src/__tests__/unit/investigation/citation-validation.spec.ts
  name: refuses a citation naming a field absent from its own cited evidence item's snapshotted fields,
    even though its concept is collected
  proves: Criterion 2 -- that a citation naming a field is still refused when that field is not among
    the cited evidence item's own snapshotted field names. This test predates this task and was left unmodified;
    the implementation record's own preserved section confirms this branch is unchanged by the fix, so
    no new test is written for this criterion.
  fails_when: isCitationValid accepts a citation naming a field that its own cited evidence item did not
    snapshot.
untested:
- rules/investigation/a-cited-field-exists-in-the-capability-output-schema -- its no-data-verdict clause
  conditions the fieldless case on the verdict a citation grounds. isCitationValid's signature carries
  no verdict, so no test against this function can decide that clause; only its field-match half is finitely
  testable here, and that half is unchanged by this fix and already covered by the pre-existing field-mismatch
  test.
- 'domain/investigation/citation -- for the same reason: field-presence is a fact conditioned on the verdict
  carried by the Evaluation that holds the citation, one level up in judgment-stage.ts. Neither isCitationValid
  nor the Citation type carries that verdict, so no test written against this task''s files decides the
  node''s fact whole.'
- 'Whether a fieldless citation attached to a confirmed or refuted verdict is refused is left unproven,
  per the task''s own UNDERDETERMINED note: isCitationValid''s signature carries no verdict to condition
  on, and enforcing that half of the invariant belongs to whichever evaluator constructs the citation,
  outside this task''s implements list.'
- Whether a fieldless citation is still refused when no evidence item in context.evidence matches its
  concept at all is an inference the implementation record states, not a fact either criterion holds;
  the only test exercising the concept-not-found branch uses a citation carrying a field, not a fieldless
  one.
not_applicable:
- edge_case: Duplicate citations within one proposed list reaching acceptedCitations
  why: Neither criterion nor either node's fact concerns deduplication or ordering; acceptedCitations'
    filter-and-preserve-order behavior is unchanged by this fix and is already exercised by a pre-existing
    test.
- edge_case: A dependency that is unavailable, slow, or answers in an unexpected shape
  why: isCitationValid and citesADeclaredField perform no I/O and call no dependency; both criteria are
    pure structural comparisons over values already held in memory.
- edge_case: Two operations against one subject running concurrently
  why: isCitationValid is a synchronous, side-effect-free function over its own arguments; neither criterion
    nor either node's fact describes shared mutable state for two calls to race over.
- edge_case: An empty collection where one comes back
  why: Neither criterion concerns acceptedCitations' output when no citation is accepted; that behavior
    is untouched by this fix and outside what either criterion states.
---

## What it is

The proof for task/no-data-citation-field-check-fix/fieldless-citation-accepted: two new tests
pinning fieldless-citation acceptance, plus the pre-existing field-mismatch test that already
protects criterion 2 unchanged.

## Notes

Suite ran clean over all six registry steps (install, typecheck, lint, secret-scan, test-unit,
test) before this record was written.
The verdict-conditioned half of both cited nodes is left untested, mirroring the task's own
UNDERDETERMINED note -- isCitationValid's signature carries no verdict to test against.
