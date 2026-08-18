---
title: Proof for PATCH /v1/cases/{slug}/versions/{version}
summary: Fastify inject()-driven proof, over a locally-assembled app registering createUpdateDraftRoutesPlugin plus
  the shared error handler, that a valid request against a draft version writes then reads back the corrected version,
  that a released version is refused before any read-back is attempted, that an unknown slug or version is refused
  the same way, and that the controller's own write-then-read ordering and optional-field handling behave as disclosed.
implementation: sha256:088afd25c13d9843aebeac57f5a5567f6f34a5fe0c8eef7f991c2e23bee8d844
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/update-draft-batch-suite-4
tests:
- file: src/__tests__/unit/http/update-draft.routes.spec.ts
  name: a valid PATCH against a draft version calls updateDraft with the exact parsed body, then readCase, and answers
    200 with the projected shape
  proves: Criterion 1
  fails_when: the status is not 200, updateDraft/readCase are called with the wrong arguments, or the body diverges
    from the projected shape read-case-route's own proof asserts.
- file: src/__tests__/unit/http/update-draft.routes.spec.ts
  name: updateDraft runs strictly before readCase, proven via a shared call-order array both mocks push into
  proves: the controller's own write-then-read ordering, so the response reflects the fresh write, never a stale
    prior read.
  fails_when: readCase is observed to run before updateDraft.
- file: src/__tests__/unit/http/update-draft.routes.spec.ts
  name: updateDraft rejecting with CaseVersionNotDraftError yields the status status-map assigns it, with matching
    code/details, and readCase is never called
  proves: Criterion 2
  fails_when: the status/code/details do not match, or readCase was called despite the rejection.
- file: src/__tests__/unit/http/update-draft.routes.spec.ts
  name: updateDraft rejecting with CaseNotFoundError yields the status status-map assigns it, with matching code/details,
    and readCase is never called
  proves: Criterion 3
  fails_when: the status/code/details do not match, or readCase was called despite the rejection.
- file: src/__tests__/unit/http/update-draft.routes.spec.ts
  name: a body missing a required field (e.g. no title) is rejected by Zod before updateDraft is ever reached
  proves: EDG-01/DTO-01 validation boundary for the body.
  fails_when: the status is not 400, or updateDraft was called.
- file: src/__tests__/unit/http/update-draft.routes.spec.ts
  name: a non-numeric :version path segment is rejected before updateDraft is reached
  proves: EDG-01/DTO-01 validation boundary for :version.
  fails_when: the status is not 400, or updateDraft was called.
- file: src/__tests__/unit/http/update-draft.routes.spec.ts
  name: an empty :version path segment mid-path is rejected before updateDraft is reached
  proves: the same empty-path-segment validation boundary this session's sibling read routes already established.
  fails_when: the status is not 400, or updateDraft was called.
- file: src/__tests__/unit/http/update-draft.routes.spec.ts
  name: a body omitting consolidation_register entirely still succeeds, and the captured call arguments confirm
    attributes carries no consolidation_register property at all
  proves: the implementation record's stated true-optional handling — never defaulted, never present as undefined.
  fails_when: the status is not 200, or updateDraft is called with a consolidation_register key present in any form.
- file: src/__tests__/unit/http/update-draft.routes.spec.ts
  name: a plain, non-domain Error from updateDraft falls through to the fixed generic envelope, never the rejected
    call's own error text, and readCase is never called
  proves: COR-04 — the shared error handler's generic-500 fallback.
  fails_when: the status is not 500, the body carries the rejected call's own error text, or readCase was called.
untested:
- The actual relational-case-store.repository.ts updateDraft implementation (read-current-state-then-guard-then-write,
  the real CaseVersionNotDraftError/CaseNotFoundError origination) is out of scope for this route-level spec by
  design — per TST-03, ICaseStore.updateDraft and ICaseQuery.readCase are stood in here as boundaries; that behavior
  is proved separately in relational-case-store.repository.spec.ts.
---

## What it is

Nine Fastify-injected tests over PATCH /v1/cases/{slug}/versions/{version}, proving all three criteria plus every disclosed inference.

## Notes

None.
