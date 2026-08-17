---
title: GET /v1/cases
summary: A thin Fastify plugin, controller and Zod DTO over the new listCases store operation, reached through ICaseQuery/CaseQueryService's
  own new pass-through.
task: sha256:065265288d80779ef3cb98070c8d1a00d27e3761fc0b174592c57c1bbb132f25
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/list-route-batch-suite-2
files:
- path: src/case/case-query.port.ts
  effect: 'adds listCases(pagination): Promise<PaginatedResponse<CaseIdentity>> to ICaseQuery.'
- path: src/case/case-query.service.ts
  effect: CaseQueryService.listCases is a bare pass-through onto ICaseStore.listCases — a bare identity listing
    has nothing to validate, unlike readCase's assembled version.
- path: src/http/dto/list-cases.dto.ts
  effect: declares listCasesQuerySchema — optional offset/limit query-string params, coerced to integers, EDG-01
    refusing malformed-but-present input while leaving absence alone.
- path: src/http/list-cases.controller.ts
  effect: handleListCasesRequest resolves offset (default 0) and limit (default defaultLimit, clamped never refused
    at maxLimit) then calls ICaseQuery.listCases, answering the page unchanged.
- path: src/http/list-cases.routes.ts
  effect: createListCasesRoutesPlugin registers GET /v1/cases under API_PREFIX, validating the query string before
    the controller runs.
criteria:
- criterion: A valid request returns a paginated page of every case's identity.
  met: true
  how: the route delegates to handleListCasesRequest, which calls ICaseQuery.listCases(pagination) — a bare pass-through
    onto the already-delivered ICaseStore.listCases — and answers its resolved page unchanged.
- criterion: The response body matches the pagination envelope src/types/pagination.ts defines.
  met: true
  how: the route answers whatever ICaseQuery.listCases resolves without reshaping it; PaginatedResponse<CaseIdentity>'s
    five fields (data/total/limit/offset/pageCount) are the store's own already-delivered computation, carried through
    unchanged.
nodes:
- node: contracts/knowledge/case-query
  how: exposes the contract's list-cases operation over HTTP, unchanged.
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-query.service.ts
  - src/http/list-cases.routes.ts
  - src/http/list-cases.controller.ts
  - src/http/dto/list-cases.dto.ts
- node: domain/knowledge/case
  how: the response's data items carry exactly CaseIdentity's own slug attribute, per the store's own already-decided
    listing shape.
  encoded_at:
  - src/case/case-query.port.ts
inferences:
- inferred: an absent offset defaults to 0; an absent limit defaults to a configured defaultLimit; a limit above
    a configured maxLimit is clamped down to it rather than refused.
  from: the standard's own API-04 requires a configured default and maximum for pagination rather than an unbounded
    page, and src/types/pagination.ts's own header comment states bounding a limit is a controller/route concern.
- inferred: defaultLimit and maxLimit arrive as this route's own configured dependencies (ListCasesControllerDependencies),
    never hardcoded in the controller or route.
  from: ARC-01/ARC-02 — every dependency arrives as an interface or a plain configured value, constructed by whichever
    factory wires this route.
preserved:
- Every existing ICaseQuery/CaseQueryService method's own behavior and signature — listCases is additive only.
- diagnose.routes.ts's and read-case.routes.ts's own API_PREFIX and shared-error-handler conventions, mirrored rather
  than altered.
deferred:
- what: registering createListCasesRoutesPlugin into build-app.ts.
  why: task/case-lifecycle-http/register-routes-in-build-app owns aggregating every one of the initiative's eighteen
    route plugins.
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the new listCases store operation.

## Notes

None.
