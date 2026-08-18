---
title: Proof for ICapabilityQuery.listCapabilities
summary: Tests establishing that listCapabilities returns every registered capability with its full contract,
  paginated, and answers an empty page rather than an error when the registry holds nothing, plus the
  pagination-envelope edge cases the criteria's pagination clause implies.
implementation: sha256:767aff0bc94cba085879939997abbfd36b01c355d4cb37376561613f97015729
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/list-query-extensions-batch-suite-2
tests:
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: returns every capability currently registered, whole with its full declared contract, in one page
  proves: Calling listCapabilities returns every capability currently registered, with its full declared
    contract, paginated per src/types/pagination.ts.
  fails_when: listCapabilities omits a registered capability, narrows any of its eight declared attributes,
    or answers a shape other than the full PaginatedResponse envelope (data/total/limit/offset/pageCount)
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: answers a registry holding no capabilities with an empty page rather than an error
  proves: Calling listCapabilities against a registry holding no capabilities returns an empty page rather
    than an error.
  fails_when: 'listCapabilities throws, rejects, or answers anything other than { data: [], total: 0,
    limit: 10, offset: 0, pageCount: 0 } for an empty store'
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: windows a page from the middle of a larger set, not just the first page
  proves: Calling listCapabilities returns every capability currently registered, with its full declared
    contract, paginated per src/types/pagination.ts. — specifically that the offset/limit window is honored
    rather than always starting from the first record
  fails_when: a non-zero offset is ignored, or the wrong slice of the held capabilities is returned for
    offset 2, limit 2 over five records
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: answers an empty data array, never an error, when the offset falls past the end of the registered
    capabilities
  proves: Calling listCapabilities returns every capability currently registered, with its full declared
    contract, paginated per src/types/pagination.ts. — the pagination boundary distinct from an empty
    registry, where the registry holds records but the requested page lies beyond them
  fails_when: an offset past the end throws, returns a non-empty data array, or the total/pageCount stop
    reflecting the registry's real size once the offset is out of range
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: computes the page count as the ceiling of total over limit when they do not divide evenly
  proves: the pagination envelope's pageCount field is computed rather than hardcoded or omitted (API-03),
    for a total/limit pair that does not divide evenly
  fails_when: pageCount is anything other than 3 for five records at limit 2
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: computes the page count exactly when total divides evenly by limit, adding no spurious page
  proves: the pageCount computation does not add an extra page when total is an exact multiple of limit
  fails_when: pageCount is 3 instead of 2 for four records at limit 2
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: answers a page count of zero for a non-positive limit rather than dividing by it
  proves: the implementation's own recorded inference — 0 for non-positive limit — and that this holds
    for both pageCount and the returned data
  fails_when: pageCount is NaN, Infinity, or nonzero for a limit of 0, or data is non-empty despite the
    zero limit
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: reads the store on every call, answering a capability registered since the previous list rather
    than a remembered one
  proves: Calling listCapabilities returns every capability currently registered... — currently meaning
    read fresh through the store each call, exactly as ICapabilityQuery.listCapabilities's own doc states
  fails_when: a second call after the store's contents changed still answers the first call's total, showing
    the result was cached rather than re-read
not_applicable:
- edge_case: absent or malformed pagination input (missing offset/limit, non-numeric values)
  why: PaginationRequest's offset and limit are required, statically-typed fields with no optional path
    at this layer; validating a raw query string against them is a route/DTO boundary concern this task
    ships no route for — the still-outstanding list-capabilities-route task owns that boundary
- edge_case: a duplicate capability appearing twice in a listed page
  why: listCapabilities performs no deduplication and no criterion or node asks it to — uniqueness of
    a concept's answering capability is enforced at registration, a different operation with its own proof
- edge_case: the store's readCapabilities rejecting or answering slowly
  why: EDG-08 scopes to .repository.ts and src/clients files, never .service.ts; CapabilityRegistryService
    takes ICapabilityStore as an injected port with no special handling required by this task's criteria
    or the nodes it implements, so a store rejection simply propagates unchanged
- edge_case: two listCapabilities calls in flight at once
  why: listCapabilities performs no write and holds no mutable state of its own; concurrent reads over
    an immutable snapshot the store returns raise no hazard this task's criteria address
untested:
- 'listCapabilities''s data field for a negative limit (e.g. -1): Array.prototype.slice(offset, offset
  + limit) with a negative end index does not necessarily answer an empty array the way limit 0 does,
  which is in tension with pageCountOf''s own documented intent that a non-positive limit answers no page
  a caller could page through. No criterion, no bound specification node, and the port''s own doc comments
  address only pageCount for this case, not data — and bounding the limit to a non-negative value is explicitly
  a route/DTO concern this task''s file set does not implement. Left unproven rather than pinned to whatever
  the slice happens to produce today.'
---

## What it is

Eight tests against the real listCapabilities implementation, unit-level over an in-memory store.

## Notes

One test (offset past the end of a non-empty registry) was added during this proof's own verification pass; the other seven were already present. Separately, and not itself a test proving a criterion: case-query.service.spec.ts, validate-case-coherence.spec.ts, read-capability.routes.spec.ts, and four investigation/*.spec.ts files each needed a minimal listCapabilities stub added to their own ICapabilityQuery fake/mock so the widened interface still compiles — mechanical, disclosed here rather than left silent, verified by running the whole suite (run/list-query-extensions-batch-suite-2): 106 files, 1068 tests, all passing.
