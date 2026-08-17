---
title: Shared pagination request and response types
summary: Adds src/types/pagination.ts, exporting PaginationRequest (offset, limit) and the generic PaginatedResponse<T>
  envelope every listing operation and route will share.
task: sha256:265baf9dfb134bc74f5a92ce4444d6a23e2be9905636ff2a4f89d1779f74a80d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-query-http-pagination-types-suite
files:
- path: src/types/pagination.ts
  effect: newly created; exports PaginationRequest (readonly offset, limit) and PaginatedResponse<T> (readonly
    data, total, limit, offset, pageCount) as the one shared pagination shape every listing store extension
    and listing HTTP route depends on
criteria:
- criterion: The module exports a pagination request type carrying offset and limit.
  met: true
  how: 'PaginationRequest is exported with exactly readonly offset: number and readonly limit: number.'
- criterion: The module exports a pagination response envelope type carrying a page of items alongside
    a total count.
  met: true
  how: 'PaginatedResponse<T> is exported carrying readonly data: readonly T[] (the page of items) and
    readonly total: number (the total count), among the other fields recorded as an inference below.'
inferences:
- inferred: PaginatedResponse<T> also carries limit, offset and pageCount, beyond the data/total pair
    the criteria name literally.
  from: the task's own objective binds this module to the standard's API-01 through API-04, not only to
    its two literal criteria; API-03 requires every listing service or controller to always compute the
    page count from the total and the limit and never omit it, and API-01 forbids any module from redeclaring
    or extending the shared PaginatedResponse envelope to carry that computed value ad hoc — the only
    way both rules hold together is for this one shared envelope to already declare the field.
- inferred: the field holding the page of items is named data, and the total-count field is named total.
  from: API-02's own wording, 'the paginated envelope carrying an empty data array,' and API-03's own
    wording, 'computes the page count from the total and the limit,' both naming these fields directly
- inferred: PaginationRequest carries no schema, no default and no maximum for limit or offset.
  from: API-04 ('a page limit is bounded by a configured maximum, and neither the default nor the maximum
    is written in source') scopes to .controller.ts and .routes.ts in its own applies_to, never to src/types
    — bounding belongs to a later route/controller task's own DTO and config read, not to this shared
    type
preserved:
- No src/types/ directory existed before this task; nothing here was already relied upon.
---

## What it is

A new src/types/pagination.ts, greenfield, carrying no business rule — the one shape every listing route and its store extension across this whole initiative shares. Implements no specification node: pagination shape is the project's own standard's concern (API-01 through API-04), never a domain fact this specification governs.

## Notes

None.
