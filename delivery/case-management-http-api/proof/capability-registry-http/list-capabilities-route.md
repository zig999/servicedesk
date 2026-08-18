---
title: GET /v1/capabilities route proof
summary: Fastify-injection tests over createListCapabilitiesRoutesPlugin proving both criteria and the
  controller's disclosed pagination-bound inferences.
implementation: sha256:c4b1ea18ca7b11c432f09783db1181c38d679cd3599419be22ea0f7ebb4ca14a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/list-route-batch2-suite
tests:
- file: src/__tests__/unit/http/list-capabilities.routes.spec.ts
  name: answers 200 with the paginated page of every capability the capability query resolved, for a request
    naming its own offset and limit
  proves: criterion 1 — a valid request returns a paginated page of every capability currently registered
  fails_when: the route answers a status other than 200, or a body different from the exact page ICapabilityQuery.listCapabilities
    resolved
- file: src/__tests__/unit/http/list-capabilities.routes.spec.ts
  name: passes the request's own offset and limit through to the capability query unchanged, when both
    are given and within bounds
  proves: criterion 1 — the request's own pagination window reaches the capability query rather than being
    recomputed or dropped
  fails_when: the controller calls listCapabilities with an offset or limit other than the ones the request
    named
- file: src/__tests__/unit/http/list-capabilities.routes.spec.ts
  name: answers a body carrying exactly the five fields src/types/pagination.ts's PaginatedResponse declares
    — data, limit, offset, pageCount and total — nothing more and nothing less
  proves: criterion 2 — the response body matches the pagination envelope src/types/pagination.ts defines
  fails_when: the body carries a field PaginatedResponse does not declare, omits one it does, or otherwise
    diverges from the five-field shape
- file: src/__tests__/unit/http/list-capabilities.routes.spec.ts
  name: answers a data array whose entries each carry every one of the capability contract's own eight
    attributes, unchanged from what the capability query resolved
  proves: criterion 2 — each item of the envelope's data array is the whole Capability the domain model
    declares, not a narrowed projection
  fails_when: an item in the response's data array is missing a declared Capability attribute or carries
    a different value than what was resolved
- file: src/__tests__/unit/http/list-capabilities.routes.spec.ts
  name: defaults offset to 0 when the request names none
  proves: the implementation record's own disclosed inference — offset defaults to 0 rather than being
    left undefined
  fails_when: the controller calls listCapabilities with an offset other than 0 for a request naming none
- file: src/__tests__/unit/http/list-capabilities.routes.spec.ts
  name: resolves an absent limit against the configured defaultLimit rather than leaving it unbounded
  proves: the disclosed inference and the standard's API-04 — an absent limit resolves to the configured
    default, never an unbounded read
  fails_when: the controller calls listCapabilities with a limit other than the configured defaultLimit
    for a request naming none
- file: src/__tests__/unit/http/list-capabilities.routes.spec.ts
  name: clamps a limit above the configured maxLimit down to maxLimit rather than refusing the request
  proves: the disclosed inference and API-04 — an oversized limit is clamped rather than rejected
  fails_when: the controller passes the requested oversized limit through unclamped, or the request is
    refused instead of served at the maximum
- file: src/__tests__/unit/http/list-capabilities.routes.spec.ts
  name: passes a limit exactly equal to the configured maxLimit through unclamped
  proves: the clamp's own boundary — a limit exactly at maxLimit is not further reduced
  fails_when: the controller reduces a limit that already equals maxLimit
- file: src/__tests__/unit/http/list-capabilities.routes.spec.ts
  name: answers the paginated envelope with an empty data array and a total of zero, unchanged, when the
    capability query resolves an empty registry
  proves: the empty-registry edge case, and API-02 — an empty list still answers the full envelope rather
    than an absent value
  fails_when: the route alters, drops a field of, or fails to relay the empty envelope the capability
    query resolved
- file: src/__tests__/unit/http/list-capabilities.routes.spec.ts
  name: answers 400 for a non-numeric offset, without ever reaching the capability query
  proves: EDG-01 — malformed input is refused at the validation boundary before the query is ever reached
  fails_when: a non-numeric offset is accepted, forwarded to the capability query, or answered with a
    status other than 400
- file: src/__tests__/unit/http/list-capabilities.routes.spec.ts
  name: answers 400 for a non-numeric limit, without ever reaching the capability query
  proves: EDG-01 for the limit parameter specifically
  fails_when: a non-numeric limit is accepted, forwarded to the capability query, or answered with a status
    other than 400
- file: src/__tests__/unit/http/list-capabilities.routes.spec.ts
  name: answers 400 for a negative offset, one below the nonnegative range the schema declares, without
    ever reaching the capability query
  proves: the DTO's nonnegative-offset boundary
  fails_when: a negative offset is accepted or forwarded rather than refused with 400
- file: src/__tests__/unit/http/list-capabilities.routes.spec.ts
  name: answers 400 for a limit of zero, one below the positive range the schema declares, without ever
    reaching the capability query
  proves: the DTO's positive-limit boundary
  fails_when: a limit of zero is accepted or forwarded rather than refused with 400
- file: src/__tests__/unit/http/list-capabilities.routes.spec.ts
  name: answers 500 with the generic envelope, never the rejected call's own error text, when the capability
    query itself rejects
  proves: a dependency failure is handled as an error rather than leaking internal detail (SEC-04)
  fails_when: the route crashes, hangs, or the response body contains the rejected call's own error text
not_applicable:
- edge_case: duplicate input / uniqueness
  why: this is a read-only listing over a query string with no identifier a caller supplies twice — nothing
    here can be duplicated.
- edge_case: concurrent operations against one subject
  why: listCapabilities is a stateless read with no shared mutable subject this route writes to; two concurrent
    requests are two independent calls, each already covered by the single-request tests.
- edge_case: a slow dependency
  why: covered functionally by the rejected-dependency test above (both are 'a dependency that fails or
    answers slowly' in the same edge-case family); latency itself is not an assertable behavior without
    a fake clock this route's contract does not call for.
---

## What it is

Fourteen Fastify-injection tests over createListCapabilitiesRoutesPlugin, with a mocked ICapabilityQuery.

## Notes

Verified by running the whole suite (run/list-route-batch2-suite): all files passing, including the 14 tests in this file directly.
