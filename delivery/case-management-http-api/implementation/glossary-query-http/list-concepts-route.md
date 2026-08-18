---
title: GET /v1/glossary/concepts route
summary: Adds the thin Fastify plugin, controller and Zod DTO exposing IGlossaryQuery.listConcepts over
  HTTP, mirroring list-cases-route's already-delivered pattern.
task: sha256:d01b11e1873b76261ee0bb11899bfc62d88e1f9e6294af3372f62c25ce37df95
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/list-route-batch2-build
files:
- path: src/http/dto/list-concepts.dto.ts
  effect: Declares listConceptsQuerySchema (offset/limit, both optional, z.coerce.number(), no bounding)
    and its inferred ListConceptsQueryDto, named for the use case per DTO-01/02/03 — mirrors list-cases.dto.ts
    field for field. Declares no response schema; the route answers the shared PaginatedResponse<Concept>
    directly (API-01).
- path: src/http/list-concepts.controller.ts
  effect: Exports ListConceptsControllerDependencies (glossaryQuery, defaultLimit, maxLimit) and handleListConceptsRequest,
    which resolves the query's offset/limit against the configured bound (resolvePagination, private helper)
    and calls glossaryQuery.listConcepts(pagination) unchanged. Constructs nothing (ARC-02), receives
    only interfaces/configured values (ARC-01).
- path: src/http/list-concepts.routes.ts
  effect: Exports createListConceptsRoutesPlugin, a Fastify plugin factory registering GET /v1/glossary/concepts
    (API-06), whose handler safeParses the query against listConceptsQuerySchema, answers 400 VALIDATION_ERROR
    on failure, otherwise 200 with the controller's resolved page unchanged. Sets no error handler of
    its own (COR-04).
criteria:
- criterion: A valid request returns a paginated page of every concept currently registered.
  met: true
  how: list-concepts.routes.ts registers GET /v1/glossary/concepts; its handler parses the (optional)
    offset/limit query params, delegates to handleListConceptsRequest, which resolves pagination bounds
    and calls glossaryQuery.listConcepts(pagination) — the already-delivered IGlossaryQuery operation
    that reads the glossary's full concept holding and windows it by offset/limit — and answers 200 with
    the resolved page unchanged.
- criterion: The response body matches the pagination envelope src/types/pagination.ts defines.
  met: true
  how: The controller's return type is PaginatedResponse<Concept> imported directly from src/types/pagination.ts
    (API-01); no response DTO is redeclared. glossaryQuery.listConcepts already returns exactly that shape
    (data, total, limit, offset, pageCount), and the route sends it unchanged.
nodes:
- node: contracts/glossary/glossary-query
  how: Exposes the contract's published list-concepts operation over HTTP for the first time. The controller
    calls IGlossaryQuery.listConcepts by interface only (ARC-01), never GlossaryService directly, matching
    the contract's own 'a consumer depends on this interface, never on the store or the service that answers
    it.'
  encoded_at:
  - src/http/list-concepts.controller.ts
  - src/http/list-concepts.routes.ts
- node: domain/glossary/concept
  how: The response envelope's data array carries Concept records (name, accepts, ttl) exactly as the
    glossary holds them, read through listConcepts with no reshaping in this route's own files; the DTO
    layer adds no schema of its own for the concept's shape, deferring to the domain type Concept imported
    from terms.js.
  encoded_at:
  - src/http/list-concepts.controller.ts
inferences:
- inferred: Bounding an absent or oversized limit against a configured defaultLimit/maxLimit belongs to
    the controller, not the DTO, and an oversized limit is capped rather than refused as malformed.
  from: Reused verbatim from list-cases.controller.ts's own already-disclosed inference (task/case-query-http/list-cases-route)
    rather than re-decided, since this task's own note says its criteria's pagination shape is the standard's
    API-01 through API-04 concern already resolved by task/case-query-http/pagination-types.
- inferred: listConcepts raises no domain error and this route therefore needs no status-map entry and
    sets no error handler of its own.
  from: The task's own instruction, corroborated by reading glossary.service.ts's listConcepts (a bare
    read over this.concepts(), no throw) and by finding no error class in src/errors/ for an unheld or
    malformed listing.
preserved:
- Every existing route file (diagnose.routes.ts, list-cases.routes.ts, read-concept.routes.ts, read-vocabulary-term.routes.ts,
  etc.) and its controller/DTO — none touched.
- GlossaryService and IGlossaryQuery (glossary.service.ts, glossary-query.port.ts) — read only, not modified;
  listConcepts already existed exactly as this route calls it.
- src/types/pagination.ts — imported, not modified.
deferred:
- what: Wiring this route into build-app.ts or a factory (e.g. a createGlossaryQuery-based composition).
  why: read-concept.routes.ts, list-cases.routes.ts and every sibling route file already delivered under
    this epic are likewise unwired into build-app.ts today, so wiring all routes together is evidently
    a separate, later concern (task/case-lifecycle-http/register-routes-in-build-app) this task does not
    reach.
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the new listConcepts query operation.

## Notes

None.
