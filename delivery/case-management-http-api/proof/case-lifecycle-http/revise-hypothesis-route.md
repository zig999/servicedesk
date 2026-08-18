---
title: Proof for POST /v1/cases/{slug}/hypotheses
summary: Fastify inject()-driven proof, over a locally-assembled app registering createReviseHypothesisRoutesPlugin plus the
  shared error handler, that a valid request calls reviseHypothesis with exactly the parsed path slug merged onto the parsed
  body and answers 201 with the originated {hypothesis_name, revision}, that a body failing Zod validation never reaches reviseHypothesis,
  that an empty collects array is passed through rather than refused at the DTO layer, and that a generic non-domain rejection
  falls through to the fixed 500 envelope — with criterion 3's CaseNotFoundError refusal left unproven and disclosed as a
  real defect rather than forced.
implementation: sha256:fb4cdac9bfe06231ad9eb5ab1c5941fe0b7e74e82e170d5f19e500f765646a9e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/hypothesis-manifest-batch-suite
tests:
- file: src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
  name: answers 201 with the hypothesis_name and revision reviseHypothesis originated, calling reviseHypothesis with exactly
    the path slug merged onto the parsed body, for a hypothesis named for the first time
  proves: Criterion 1 (new hypothesis)
  fails_when: the status is not 201, or reviseHypothesis is called with anything other than {slug, hypothesis_name, criterion,
    collects, resolution, subject} exactly as sent.
- file: src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
  name: answers 201 with the next revision number reviseHypothesis originated, calling reviseHypothesis with the same exact
    shape, when revising an already-existing hypothesis
  proves: Criterion 1 (existing hypothesis)
  fails_when: the status is not 201, or reviseHypothesis is called with a diverging shape.
- file: src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
  name: answers 400 for a body missing the required criterion attribute, without ever reaching reviseHypothesis
  proves: Criterion 2
  fails_when: the status is not 400, or reviseHypothesis was called.
- file: src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
  name: answers 400 for a body missing the required hypothesis_name attribute, without ever reaching reviseHypothesis
  proves: Criterion 2, a second required field.
  fails_when: the status is not 400, or reviseHypothesis was called.
- file: src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
  name: answers 400 for a malformed resolution whose referral is missing its required recipient, without ever reaching reviseHypothesis
  proves: Criterion 2's coverage of a malformed nested object.
  fails_when: the status is not 400, or reviseHypothesis was called.
- file: src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
  name: answers 400 for a collects array containing an empty-string entry, without ever reaching reviseHypothesis
  proves: reviseHypothesisBodySchema's own z.array(z.string().min(1)) element validation.
  fails_when: the status is not 400, or reviseHypothesis was called.
- file: src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
  name: succeeds, calling reviseHypothesis with an empty collects array rather than refusing it at the validation boundary,
    since the domain operation raises its own typed refusal for an empty collects
  proves: the DTO's own disclosed inference — collects is validated element-wise but never required non-empty at this boundary.
  fails_when: an empty collects array is rejected with 400 at this boundary instead of reaching reviseHypothesis unchanged.
- file: src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
  name: answers 400 via validation for a request with an empty :slug segment, never 404 "route not found"
  proves: Criterion 2 extended to the path parameter, EDG-01.
  fails_when: the status is not 400, or reviseHypothesis was called.
- file: src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
  name: answers the unchanged generic envelope, never a partial body or leaked detail, when reviseHypothesis rejects with
    a generic, non-domain error
  proves: COR-04 — the shared error handler's generic-500 fallback.
  fails_when: the status is not 500, or the body leaks the rejected call's own error text.
not_applicable:
- edge_case: a missing subject, resolution or collects field on its own
  why: the same required-field mechanism is already exercised by the missing-criterion and missing-hypothesis_name tests;
    a permutation over every remaining field walks the identical code path.
- edge_case: two revise-hypothesis requests against one subject concurrently
  why: no bound node states a concurrency guarantee for this route, and CaseLifecycleOperations['reviseHypothesis'] is stood
    in as a boundary (TST-03) — any serialization behavior belongs to the case store beneath it.
- edge_case: an unversioned or malformed URL entirely outside the registered route
  why: API-06's versioned-prefix placement is a routing-registration fact already established by every sibling route's own
    precedent, not a per-task behavior this route's own criteria restate.
untested:
- 'Criterion 3 ("A request naming a case slug that does not exist is refused with the status status-map assigns CaseNotFoundError")
  is not proven by this proof, and this is a genuine unmet criterion, not a coverage shortcut. Tracing the call graph: revise-hypothesis.operation.ts''s
  own refuseWithoutDraft calls ICaseStore.findDraftVersion(slug), which returns undefined both for a slug the "cases" table
  holds no row for and for an existing case currently holding no draft — both throw CaseHoldsNoDraftError, never CaseNotFoundError.
  CaseHoldsNoDraftError has no entry in status-map.ts, so it falls through to the generic 500 handler today rather than the
  404 this criterion states. This is a real, confirmed defect in already-delivered domain code from an earlier initiative,
  out of this task''s own scope to fix. No test asserting the 404 this criterion names could be written without failing against
  the real call graph, and no test asserting the 500 it actually produces would prove the criterion rather than document the
  defect, so neither was written; the gap is recorded here and in the implementation record''s own criterion 3 (met: false),
  for a human to route through a corrective task.'
---

## What it is

Nine Fastify-injected tests over POST /v1/cases/{slug}/hypotheses, proving criteria 1 and 2 in full — criterion 3 honestly left unproven, a disclosed defect rather than a gap.

## Notes

None.
