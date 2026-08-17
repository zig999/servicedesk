---
title: Compile-time proof for the shared pagination types
summary: Proves PaginationRequest and PaginatedResponse<T> in src/types/pagination.ts carry exactly the
  fields the task's two criteria and the implementation's two disclosed inferences state, using vitest's
  built-in expectTypeOf and @ts-expect-error rather than any runtime assertion, since the module is pure
  types with nothing that executes.
implementation: sha256:e08244632862c0e95b872259be009725a4c595d4158cbf74dcd73fa4e4c6c8ac
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-query-http-pagination-types-suite
tests:
- file: src/__tests__/unit/types/pagination.spec.ts
  name: a pagination request is exactly an offset and a limit, both numbers, and nothing else
  proves: 'Criterion: The module exports a pagination request type carrying offset and limit.'
  fails_when: PaginationRequest gains, loses, renames or retypes a field.
- file: src/__tests__/unit/types/pagination.spec.ts
  name: refuses a pagination request literal that also carries a configured bound of its own
  proves: 'The implementation''s own inference: PaginationRequest deliberately carries no configured bound
    of its own.'
  fails_when: PaginationRequest is widened to accept an extra field of its own.
- file: src/__tests__/unit/types/pagination.spec.ts
  name: a paginated response carries a page of items and a total count, whatever the item type
  proves: 'Criterion: The module exports a pagination response envelope type carrying a page of items
    alongside a total count.'
  fails_when: data or total is removed, renamed, or retyped away from a readonly array of the item type
    and a number respectively.
- file: src/__tests__/unit/types/pagination.spec.ts
  name: a paginated response is exactly the page of items, the total, and the limit, offset and page count
    it was produced with
  proves: 'The implementation''s own inference: the shared envelope also carries limit, offset and pageCount.'
  fails_when: any of data, total, limit, offset or pageCount is removed, renamed, retyped, or a sixth
    field is added.
- file: src/__tests__/unit/types/pagination.spec.ts
  name: refuses a paginated response literal that omits the limit, offset or page count it was produced
    with
  proves: limit, offset and pageCount are required fields of the shared envelope, not optional additions.
  fails_when: limit, offset or pageCount become optional (or are removed) on PaginatedResponse.
- file: src/__tests__/unit/types/pagination.spec.ts
  name: a paginated response's data follows the item type it is instantiated with, rather than a hardcoded
    shape
  proves: Criterion 2's 'page of items' holds for whatever item type a listing actually returns.
  fails_when: data stops tracking the generic parameter T.
- file: src/__tests__/unit/types/pagination.spec.ts
  name: accepts an empty page of items, so a response with no items still satisfies the shape
  proves: The envelope's data field permits an empty array (API-02's own edge case at the type level).
  fails_when: data is narrowed to require at least one item.
not_applicable:
- edge_case: absent or empty runtime input to a function
  why: the module declares no function — PaginationRequest and PaginatedResponse<T> are type declarations
    only.
- edge_case: a boundary at each end of a stated numeric range (offset/limit minimums or maximums)
  why: bounding a limit against a configured default and maximum is deliberately a route/controller concern
    outside this module (API-04).
- edge_case: a duplicate where uniqueness is claimed
  why: neither type expresses or implies a uniqueness constraint over anything.
- edge_case: an operation attempted against state that forbids it
  why: the module holds no state and performs no operation.
- edge_case: a dependency that fails, is slow, or answers in an unexpected shape
  why: the module has no dependency of its own.
- edge_case: two operations against one subject at once
  why: there is no operation, so there is nothing to run concurrently.
untested:
- Whether every listing route, controller or DTO that answers with a page actually imports this PaginatedResponse
  rather than redeclaring it — that reuse is each listing task's own criterion and proof, not this one's.
- Whether a real service or controller assembling a PaginatedResponse<T> at runtime actually computes
  pageCount from total and limit (API-03) rather than hardcoding it — who computes its value belongs to
  whichever listing service is built against it.
divergences:
- cites: TST-01
  file: src/__tests__/unit/types/pagination.spec.ts
  departure: Five of the seven tests have no separate act step visibly distinct from arrange and assert.
  why: TST-01 presupposes a test that does something and then checks what happened; a compile-time type
    comparison has nothing to do — the type either matches or it does not, checked by npm run typecheck
    rather than by any step this file's own execution takes.
---

## What it is

Seven compile-time tests, using vitest's expectTypeOf and @ts-expect-error, proving both criteria and the two disclosed inferences over a module that declares types only.

## Notes

None.
