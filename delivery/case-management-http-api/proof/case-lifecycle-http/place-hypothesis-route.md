---
title: Proof for PUT /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name}
summary: Fastify inject()-driven proof, over a locally-assembled app registering createPlaceHypothesisRoutesPlugin plus the
  shared error handler, that a valid placement answers a wholly empty 204, that both named refusals resolve to the status
  status-map assigns, and that path/body validation boundaries and the generic-500 fallback behave as disclosed.
implementation: sha256:53c143df77b10b087d77d1bb7c9d5953a496400683118d36e89ac5672555de9e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/hypothesis-manifest-batch-suite
tests:
- file: src/__tests__/unit/http/place-hypothesis.routes.spec.ts
  name: places the named hypothesis's stated revision at the stated manifest position, and answers 204 with a wholly empty
    body
  proves: Criterion 1
  fails_when: placeHypothesis is called with a field diverging from the parsed request, or the response is not an empty 204.
- file: src/__tests__/unit/http/place-hypothesis.routes.spec.ts
  name: refuses with the status the status map assigns CaseVersionNotDraftError when the named version is not draft
  proves: Criterion 2
  fails_when: the status/code/details do not match status-map.ts's own entry (409).
- file: src/__tests__/unit/http/place-hypothesis.routes.spec.ts
  name: refuses with the status the status map assigns ManifestPositionOccupiedError when the named position is already held
    by a different hypothesis
  proves: Criterion 3
  fails_when: the status/code/details do not match status-map.ts's own entry (409).
- file: src/__tests__/unit/http/place-hypothesis.routes.spec.ts
  name: answers 400 for a body missing revision, without ever reaching placeHypothesis
  proves: EDG-01/DTO-01 validation boundary.
  fails_when: the status is not 400, or placeHypothesis was called.
- file: src/__tests__/unit/http/place-hypothesis.routes.spec.ts
  name: answers 400 for a body missing position, without ever reaching placeHypothesis
  proves: EDG-01/DTO-01 validation boundary, second required field.
  fails_when: the status is not 400, or placeHypothesis was called.
- file: src/__tests__/unit/http/place-hypothesis.routes.spec.ts
  name: answers 400 for a revision of 0, one below the schema's own disclosed .positive() lower boundary, without ever reaching
    placeHypothesis
  proves: the DTO's own disclosed .positive() inference for revision.
  fails_when: revision 0 is accepted, or placeHypothesis is called with it.
- file: src/__tests__/unit/http/place-hypothesis.routes.spec.ts
  name: answers 400 for a position of 0, one below the schema's own disclosed .positive() lower boundary, without ever reaching
    placeHypothesis
  proves: the same disclosed .positive() inference for position.
  fails_when: position 0 is accepted, or placeHypothesis is called with it.
- file: src/__tests__/unit/http/place-hypothesis.routes.spec.ts
  name: answers 400 for a non-numeric version segment, without ever reaching placeHypothesis
  proves: EDG-01/DTO-01 validation boundary for :version.
  fails_when: the status is not 400, or placeHypothesis was called.
- file: src/__tests__/unit/http/place-hypothesis.routes.spec.ts
  name: answers 400 via validation for a request with an empty :slug segment, never 404 "route not found"
  proves: the empty-path-segment validation boundary for :slug.
  fails_when: the status is not 400, or placeHypothesis was called.
- file: src/__tests__/unit/http/place-hypothesis.routes.spec.ts
  name: answers 400 via validation for a request with an empty :version segment, never 404 "route not found"
  proves: the same empty-path-segment validation boundary for :version.
  fails_when: the status is not 400, or placeHypothesis was called.
- file: src/__tests__/unit/http/place-hypothesis.routes.spec.ts
  name: answers 400 via validation for a request with an empty :hypothesis_name segment, never 404 "route not found"
  proves: the same empty-path-segment validation boundary, for this route's own third path segment.
  fails_when: the status is not 400, or placeHypothesis was called.
- file: src/__tests__/unit/http/place-hypothesis.routes.spec.ts
  name: answers the unchanged generic envelope, never the rejected call's own error text, when placeHypothesis rejects with
    a generic, non-domain error
  proves: COR-04 — the shared error handler's generic-500 fallback.
  fails_when: the status is not 500, or the body carries the rejected call's own error text.
untested:
- 'CaseNotFoundError propagation from placeHypothesis (an unknown slug/version) is not tested here: no criterion of this task
  names it. That behavior is proved separately in manifest-composition.operations.spec.ts, and its status-map wiring (404)
  is exercised by the sibling routes (discard, update-draft, release) whose own criteria do name it — the identical error-mapping
  code path is not left unexercised in the suite as a whole, but this file itself carries no direct assertion of it.'
---

## What it is

Twelve Fastify-injected tests over PUT /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name}, proving all three criteria plus validation boundaries.

## Notes

None.
