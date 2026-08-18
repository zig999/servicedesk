---
title: Proof for DELETE /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name}
summary: Fastify inject()-driven proof, over a locally-assembled app registering createRemoveHypothesisRoutesPlugin plus the
  shared error handler, that a valid removal answers a wholly empty 204, that both named refusals resolve to the status status-map
  assigns, and that path validation and the generic-500 fallback behave as disclosed.
implementation: sha256:73bf83d11328ad2f814503fc02b4f3e52543d29809c6aa115a27b69e3a44dd31
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/hypothesis-manifest-batch-suite
tests:
- file: src/__tests__/unit/http/remove-hypothesis.routes.spec.ts
  name: removes the named hypothesis manifest entry through removeHypothesis and answers 204 with a wholly empty body
  proves: Criterion 1
  fails_when: removeHypothesis is called with anything but {slug, version, hypothesis_name} parsed from the request, or the
    response is not an empty 204.
- file: src/__tests__/unit/http/remove-hypothesis.routes.spec.ts
  name: refuses with the status the status map assigns ManifestWouldHoldNoHypothesisError when the removal would leave the
    manifest empty
  proves: Criterion 2
  fails_when: the status/code/details do not match status-map.ts's own entry (422).
- file: src/__tests__/unit/http/remove-hypothesis.routes.spec.ts
  name: refuses with the status the status map assigns CaseVersionNotDraftError when the named version is released
  proves: Criterion 3
  fails_when: the status/code/details do not match status-map.ts's own entry (409).
- file: src/__tests__/unit/http/remove-hypothesis.routes.spec.ts
  name: answers 400 for a non-numeric version segment, without ever reaching removeHypothesis
  proves: EDG-01/DTO-01 validation boundary for :version.
  fails_when: the status is not 400, or removeHypothesis was called.
- file: src/__tests__/unit/http/remove-hypothesis.routes.spec.ts
  name: answers 400 for a version segment of 0, the schema's own positive-integer boundary, without ever reaching removeHypothesis
  proves: the params schema's own .positive() boundary, refusing a non-positive version rather than coercing it through.
  fails_when: version 0 is accepted, or removeHypothesis is called with it.
- file: src/__tests__/unit/http/remove-hypothesis.routes.spec.ts
  name: answers 400 via validation for a request with an empty slug segment, without ever reaching removeHypothesis
  proves: the empty-path-segment validation boundary for :slug.
  fails_when: the status is not 400, or removeHypothesis was called.
- file: src/__tests__/unit/http/remove-hypothesis.routes.spec.ts
  name: answers 400 via validation for a request with an empty version segment, without ever reaching removeHypothesis
  proves: the same empty-path-segment validation boundary for :version.
  fails_when: the status is not 400, or removeHypothesis was called.
- file: src/__tests__/unit/http/remove-hypothesis.routes.spec.ts
  name: answers 400 via validation for a request with an empty hypothesis_name segment, without ever reaching removeHypothesis
  proves: the same empty-path-segment validation boundary, for this route's own third path segment.
  fails_when: the status is not 400, or removeHypothesis was called.
- file: src/__tests__/unit/http/remove-hypothesis.routes.spec.ts
  name: answers the unchanged generic envelope, never a partial body or leaked detail, when removeHypothesis rejects with
    a generic, non-domain error
  proves: COR-04 — the shared error handler's generic-500 fallback.
  fails_when: the status is not 500, or the body carries the rejected call's own error text.
untested:
- 'CaseNotFoundError propagation from removeHypothesis (an unknown slug or a slug whose named version is not stored) is not
  tested here: none of this task''s three stated criteria names it, though the controller and routes'' own header comments
  document it as left to propagate the same way discard-route''s own CaseNotFoundError is. Leaving it untested is a finding
  about this task''s own criteria, not a claim that the propagation was verified.'
---

## What it is

Nine Fastify-injected tests over DELETE /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name}, proving all three criteria plus validation boundaries.

## Notes

None.
