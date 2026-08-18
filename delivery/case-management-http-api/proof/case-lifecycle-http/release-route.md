---
title: Proof for POST /v1/cases/{slug}/versions/{version}/release
summary: Fastify inject()-driven proof, over a locally-assembled app registering createReleaseRoutesPlugin plus the shared
  error handler, that a valid release writes then reads back the released version, that the write-then-read ordering holds,
  that an already-released version and an unreleasable manifest are each refused with every violated rule reported together,
  and that an unknown slug/version and validation boundaries behave as disclosed.
implementation: sha256:9454a6c5bc9ca0e134da77b8a63b9be452820563ecde1e38f2649c744af20b77
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/create-draft-batch-suite
tests:
- file: src/__tests__/unit/http/release.routes.spec.ts
  name: answers 200 with the version now in released state, read back whole through the published case-query and projected
    the same way read-case-route already is
  proves: Criterion 1
  fails_when: the status is not 200, or the body diverges from the projected shape read-case-route's own proof asserts.
- file: src/__tests__/unit/http/release.routes.spec.ts
  name: calls release before readCase, so the response reflects the transition just made rather than a stale prior read
  proves: the controller's own write-then-read ordering, proven via a shared call-order array both mocks push into.
  fails_when: readCase is observed to run before release.
- file: src/__tests__/unit/http/release.routes.spec.ts
  name: refuses with the status the status map assigns CaseVersionNotDraftAtReleaseError, and never reads the version back,
    when the named version is already released
  proves: Criterion 2
  fails_when: the status/code/details do not match status-map.ts's own entry (409), or readCase was called despite the rejection.
- file: src/__tests__/unit/http/release.routes.spec.ts
  name: refuses with the status the status map assigns CaseVersionNotReleasableError, naming every violated rule together,
    and never reads the version back, when the assembled manifest fails more than one rule
  proves: Criterion 3
  fails_when: the status/code/details do not match, not every violated rule is named, or readCase was called despite the rejection.
- file: src/__tests__/unit/http/release.routes.spec.ts
  name: refuses with the status the status map assigns CaseNotFoundError, and never reads the version back, when no version
    answers the named slug and version
  proves: the CaseNotFoundError edge, symmetric with the other write routes' own handling.
  fails_when: the status/code/details do not match, or readCase was called despite the rejection.
- file: src/__tests__/unit/http/release.routes.spec.ts
  name: answers 400 for a non-numeric version segment, without ever reaching release
  proves: EDG-01/DTO-01 validation boundary for :version.
  fails_when: the status is not 400, or release was called.
- file: src/__tests__/unit/http/release.routes.spec.ts
  name: answers 400 via validation for a request with an empty :slug segment, never 404 "route not found"
  proves: the same empty-path-segment validation boundary this session's sibling routes already established, for :slug.
  fails_when: the status is not 400, or release was called.
- file: src/__tests__/unit/http/release.routes.spec.ts
  name: answers 400 via validation for a request with an empty :version segment, never 404 "route not found"
  proves: the same empty-path-segment validation boundary, for :version.
  fails_when: the status is not 400, or release was called.
- file: src/__tests__/unit/http/release.routes.spec.ts
  name: answers 500 with the generic envelope, never the rejected call's own error text, when release itself rejects with
    an untyped error
  proves: COR-04 — the shared error handler's generic-500 fallback.
  fails_when: the status is not 500, or the body carries the rejected call's own error text.
untested:
- The actual ReleaseOperation/case-store release implementation (the manifest-coherence validation itself, CaseVersionNotDraftAtReleaseError/CaseVersionNotReleasableError
  origination) is out of scope for this route-level spec by design — per TST-03, CaseLifecycleOperations['release'] and ICaseQuery
  are stood in here as boundaries; that behavior is proved separately where release.operation.ts and the underlying store
  were delivered.
---

## What it is

Nine Fastify-injected tests over POST /v1/cases/{slug}/versions/{version}/release, proving all three criteria plus call-order and validation boundaries.

## Notes

None.
