---
title: GET /v1/capabilities — the list-capabilities HTTP route
summary: A new Fastify plugin, controller and Zod query DTO exposing ICapabilityQuery.listCapabilities
  over HTTP, mirroring list-cases-route's own three-file pattern exactly.
task: sha256:7527a7bcb3525e3836fa0e177e187283da2ea7548aacf98a69b3235a2f38ec23
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/list-route-batch2-build
files:
- path: src/http/dto/list-capabilities.dto.ts
  effect: Declares listCapabilitiesQuerySchema (offset/limit, both optional, z.coerce.number()) and its
    inferred ListCapabilitiesQueryDto, following listCasesQuerySchema's own shape verbatim; declares no
    response schema, since the route answers the shared PaginatedResponse<Capability> from src/types/pagination.ts.
- path: src/http/list-capabilities.controller.ts
  effect: Exposes ListCapabilitiesControllerDependencies (capabilityQuery, defaultLimit, maxLimit) and
    handleListCapabilitiesRequest, which resolves the query's optional offset/limit against the configured
    bound (resolvePagination) and calls capabilityQuery.listCapabilities(pagination), returning the page
    unchanged.
- path: src/http/list-capabilities.routes.ts
  effect: Exposes createListCapabilitiesRoutesPlugin, registering GET /v1/capabilities under API_PREFIX
    = '/v1'; safeParses the query against listCapabilitiesQuerySchema, answers 400 VALIDATION_ERROR on
    failure, otherwise calls handleListCapabilitiesRequest and answers 200 with the resolved page.
criteria:
- criterion: A valid request returns a paginated page of every capability currently registered.
  met: true
  how: listCapabilitiesHandler parses the query string, resolvePagination computes the offset/limit window
    against the route's configured default and maximum, and handleListCapabilitiesRequest calls dependencies.capabilityQuery.listCapabilities(pagination)
    — the published ICapabilityQuery operation that reads every currently registered capability through
    the store on every call — answering with its page unchanged at 200.
- criterion: The response body matches the pagination envelope src/types/pagination.ts defines.
  met: true
  how: handleListCapabilitiesRequest's return type is PaginatedResponse<Capability>, the shared envelope
    imported directly from src/types/pagination.ts (API-01); nothing in the controller or route recomputes
    or narrows any of its fields (data, total, limit, offset, pageCount) — they are answered exactly as
    ICapabilityQuery.listCapabilities computed them.
nodes:
- node: contracts/integration/capability-registry
  how: 'the contract''s list-capabilities operation — every capability currently registered, paginated,
    read through the store on every call — is exposed over HTTP unchanged: the controller calls ICapabilityQuery.listCapabilities
    and returns its page as-is, and the route answers it at 200 with no narrowing or recomputation.'
  encoded_at:
  - src/http/dto/list-capabilities.dto.ts
  - src/http/list-capabilities.controller.ts
  - src/http/list-capabilities.routes.ts
inferences:
- inferred: an oversized requested limit is capped at the configured maxLimit rather than refused as a
    400 validation error.
  from: list-cases.controller.ts's own resolvePagination and its own disclosed inference, which this route
    mirrors verbatim per the task's explicit instruction to follow the exact list-cases precedent — an
    oversized limit is not a request naming anything malformed, so EDG-01's validation-boundary refusal
    does not reach it.
- inferred: listCapabilities raises no domain error the route must map through the status map, so this
    task adds no status-map entry.
  from: the task's own body states this directly, mirroring list-cases-route's own reasoning that a bare
    read of a store/registry with no path or body parameter naming a resource has no domain error of its
    own to propagate.
deferred:
- what: wiring createListCapabilitiesRoutesPlugin into build-app.ts, and supplying the concrete capabilityQuery,
    defaultLimit and maxLimit values through a factory (mirroring createCapabilityQuery for read-capability-route).
  why: that composition is task/case-lifecycle-http/register-routes-in-build-app's own objective, which
    this task depends on being delivered separately rather than reaching into itself.
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the new listCapabilities query operation.

## Notes

None.
