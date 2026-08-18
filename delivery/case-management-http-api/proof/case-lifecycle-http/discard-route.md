---
title: Proof for DELETE /v1/cases/{slug}/versions/{version}
summary: Fastify inject()-driven proof, over a locally-assembled app registering createDiscardRoutesPlugin plus the shared
  error handler, that a valid delete removes a draft version and answers a wholly empty 204, that an already-released version
  and an unknown slug/version are each refused with the status status-map assigns, and that path validation runs before discard.
implementation: sha256:32a8fbbaafbec8f1333be4250c690d79b362f15892514a41357c1e157d12c5f2
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/create-draft-batch-suite
tests:
- file: src/__tests__/unit/http/discard.routes.spec.ts
  name: removes the named draft version through discard and answers 204 with a wholly empty body
  proves: Criterion 1
  fails_when: the status is not 204, response.body is not the empty string, or rawPayload.length is not 0.
- file: src/__tests__/unit/http/discard.routes.spec.ts
  name: refuses with the status the status map assigns CaseVersionNotDraftError when the named version is not draft
  proves: Criterion 2
  fails_when: the status/code/details do not match status-map.ts's own CaseVersionNotDraftError entry (409).
- file: src/__tests__/unit/http/discard.routes.spec.ts
  name: refuses with the status the status map assigns CaseNotFoundError when no version answers an unknown slug
  proves: Criterion 3 (unknown-slug case)
  fails_when: the status/code/details do not match status-map.ts's own CaseNotFoundError entry (404).
- file: src/__tests__/unit/http/discard.routes.spec.ts
  name: refuses with the status the status map assigns CaseNotFoundError when the slug is known but the named version is not
  proves: Criterion 3 (known-slug-unknown-version case, the same scope-boundary pattern list-hypothesis-revisions-route already
    established)
  fails_when: the status/code/details do not match, or the two edges are conflated.
- file: src/__tests__/unit/http/discard.routes.spec.ts
  name: answers 400 for a non-numeric version segment, without ever reaching discard
  proves: EDG-01/DTO-01 validation boundary for :version.
  fails_when: the status is not 400, or discard was called.
- file: src/__tests__/unit/http/discard.routes.spec.ts
  name: answers 400 via validation for a request with an empty version segment, without ever reaching discard
  proves: the same empty-path-segment validation boundary this session's sibling routes already established, for :version.
  fails_when: the status is not 400, or discard was called.
- file: src/__tests__/unit/http/discard.routes.spec.ts
  name: answers 400 via validation for a request with an empty slug segment, without ever reaching discard
  proves: the same empty-path-segment validation boundary, for :slug.
  fails_when: the status is not 400, or discard was called.
- file: src/__tests__/unit/http/discard.routes.spec.ts
  name: answers the unchanged generic envelope, never a partial body or leaked detail, when discard rejects with a generic,
    non-domain error
  proves: COR-04 — the shared error handler's generic-500 fallback.
  fails_when: the status is not 500, or the body carries the rejected call's own error text.
untested:
- The actual discardCaseVersion/case-store discard implementation (the current-state read, the CaseNotFoundError/CaseVersionNotDraftError
  guards themselves, the manifest-entry cascade) is out of scope for this route-level spec by design — per TST-03, CaseLifecycleOperations['discard']
  is stood in here as a boundary; that behavior is proved separately where discard.operation.ts and the underlying store were
  delivered.
---

## What it is

Eight Fastify-injected tests over DELETE /v1/cases/{slug}/versions/{version}, proving all three criteria plus the empirically-verified empty-204 body and validation boundaries.

## Notes

None.
