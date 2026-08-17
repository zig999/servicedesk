---
title: Proof for GET /v1/cases
summary: Fastify inject()-driven proof, over a locally-assembled app registering createListCasesRoutesPlugin plus
  the shared error handler, that a valid request returns the paginated page of every case's identity unchanged,
  and that the controller's own pagination-bound resolution behaves as this task's delivery record discloses it
  inferred.
implementation: sha256:da1a5a92eab237e3bc4958de9796e63b0507766ff7be51cedb8995f276642924
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/list-route-batch-suite-2
tests:
- file: src/__tests__/unit/http/list-cases.routes.spec.ts
  name: answers 200 with the paginated page of every case's identity the case query resolved, for a request naming
    its own offset and limit
  proves: Criterion 1
  fails_when: the status is not 200, or the body diverges from the page ICaseQuery.listCases resolved.
- file: src/__tests__/unit/http/list-cases.routes.spec.ts
  name: passes the request's own offset and limit through to the case query unchanged, when both are given and within
    bounds
  proves: the controller's own pass-through of a within-bounds request.
  fails_when: ICaseQuery.listCases is called with a different offset or limit than the request named.
- file: src/__tests__/unit/http/list-cases.routes.spec.ts
  name: answers a body carrying exactly the five fields src/types/pagination.ts's PaginatedResponse declares — data,
    limit, offset, pageCount and total — nothing more and nothing less
  proves: Criterion 2
  fails_when: the response body carries a different key set than exactly those five fields.
- file: src/__tests__/unit/http/list-cases.routes.spec.ts
  name: defaults offset to 0 when the request names none
  proves: the implementation record's stated offset-default inference.
  fails_when: ICaseQuery.listCases is called with any offset other than 0 for a request naming none.
- file: src/__tests__/unit/http/list-cases.routes.spec.ts
  name: resolves an absent limit against the configured defaultLimit rather than leaving it unbounded
  proves: the implementation record's stated limit-default inference.
  fails_when: ICaseQuery.listCases is called with any limit other than the configured defaultLimit for a request
    naming none.
- file: src/__tests__/unit/http/list-cases.routes.spec.ts
  name: clamps a limit above the configured maxLimit down to maxLimit rather than refusing the request
  proves: the implementation record's stated clamping inference.
  fails_when: the status is not 200, or ICaseQuery.listCases is called with a limit other than maxLimit.
- file: src/__tests__/unit/http/list-cases.routes.spec.ts
  name: passes a limit exactly equal to the configured maxLimit through unclamped
  proves: the boundary of the clamping inference.
  fails_when: ICaseQuery.listCases is called with a limit other than the exact maxLimit named.
- file: src/__tests__/unit/http/list-cases.routes.spec.ts
  name: answers the paginated envelope with an empty data array and a total of zero, unchanged, when the case query
    resolves an empty store
  proves: API-02 — an empty collection answers an empty envelope, not an error.
  fails_when: the status is not 200, or the body diverges from the empty envelope ICaseQuery.listCases resolved.
- file: src/__tests__/unit/http/list-cases.routes.spec.ts
  name: answers 400 for a non-numeric offset, without ever reaching the case query
  proves: EDG-01/DTO-01 validation boundary for offset.
  fails_when: the status is not 400, or ICaseQuery.listCases was called.
- file: src/__tests__/unit/http/list-cases.routes.spec.ts
  name: answers 400 for a non-numeric limit, without ever reaching the case query
  proves: EDG-01/DTO-01 validation boundary for limit.
  fails_when: the status is not 400, or ICaseQuery.listCases was called.
- file: src/__tests__/unit/http/list-cases.routes.spec.ts
  name: answers 400 for a negative offset, one below the nonnegative range the schema declares, without ever reaching
    the case query
  proves: the lower boundary of the offset schema's nonnegative() constraint.
  fails_when: the status is not 400, or ICaseQuery.listCases was called.
- file: src/__tests__/unit/http/list-cases.routes.spec.ts
  name: answers 400 for a limit of zero, one below the positive range the schema declares, without ever reaching
    the case query
  proves: the lower boundary of the limit schema's positive() constraint.
  fails_when: the status is not 400, or ICaseQuery.listCases was called.
- file: src/__tests__/unit/http/list-cases.routes.spec.ts
  name: answers 500 with the generic envelope, never the rejected call's own error text, when the case query itself
    rejects
  proves: COR-04 — the shared error handler's generic-500 fallback.
  fails_when: the status is not 500, or the body carries the rejected call's own error text.
untested:
- An empty-string query value (e.g. ?offset=) coerces to 0 via z.coerce.number()'s own Number('') behavior and passes
  validation, ambiguous between "absent, default to 0" and "malformed, refuse" — no criterion or node in this task's
  scope pins which is intended.
---

## What it is

Fourteen Fastify-injected tests over GET /v1/cases, proving both criteria plus every disclosed inference.

## Notes

None.
