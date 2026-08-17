---
title: GET /v1/cases/{slug}/versions
summary: A thin Fastify plugin, controller and Zod DTO over the new listCaseVersions store operation, reached through
  ICaseQuery/CaseQueryService's own new pass-through.
task: sha256:4bee935c1c14a81db6cdf4a2a9b2f729898b38b5acea89dee1761ba46f32a683
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/list-route-batch-suite-2
files:
- path: src/case/case-query.port.ts
  effect: 'adds listCaseVersions(slug, pagination): Promise<PaginatedResponse<CaseVersionListItem>> to ICaseQuery.'
- path: src/case/case-query.service.ts
  effect: CaseQueryService.listCaseVersions is a bare pass-through onto ICaseStore.listCaseVersions; the store itself
    raises CaseNotFoundError for an unknown slug, neither caught nor re-raised here.
- path: src/http/dto/list-case-versions.dto.ts
  effect: declares listCaseVersionsParamsSchema (:slug, non-empty) and listCaseVersionsQuerySchema (offset/limit,
    optional, coerced).
- path: src/http/list-case-versions.controller.ts
  effect: handleListCaseVersionsRequest resolves pagination (offset default 0, limit default/clamp against defaultLimit/maxLimit)
    then calls ICaseQuery.listCaseVersions(slug, pagination).
- path: src/http/list-case-versions.routes.ts
  effect: createListCaseVersionsRoutesPlugin registers GET /v1/cases/:slug/versions, validating :slug and the query
    string before the controller runs, leaving CaseNotFoundError to propagate uncaught.
criteria:
- criterion: A valid request against an existing slug returns a paginated page of every version that case holds.
  met: true
  how: the route delegates to handleListCaseVersionsRequest, which calls ICaseQuery.listCaseVersions(slug, pagination)
    — a bare pass-through onto the already-delivered ICaseStore.listCaseVersions — and answers its resolved page
    unchanged.
- criterion: A request naming a slug that does not exist is refused with the status status-map assigns CaseNotFoundError.
  met: true
  how: the store's own requireCaseIdentity throws CaseNotFoundError for an unknown slug before any version row is
    read; the service, controller and route add no catch of their own, so it reaches error-handler.middleware.ts
    unchanged, which status-map.ts already resolves.
nodes:
- node: contracts/knowledge/case-query
  how: exposes the contract's list-case-versions operation over HTTP, unchanged.
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-query.service.ts
  - src/http/list-case-versions.routes.ts
  - src/http/list-case-versions.controller.ts
  - src/http/dto/list-case-versions.dto.ts
- node: domain/knowledge/case
  how: the route resolves the case identity the :slug path segment names, refusing CaseNotFoundError where it names
    nothing stored.
  encoded_at:
  - src/http/dto/list-case-versions.dto.ts
- node: domain/knowledge/case-version
  how: the response's data items carry CaseVersionListItem's own already-decided per-version listing shape.
  encoded_at:
  - src/case/case-query.port.ts
inferences:
- inferred: :slug is validated as a non-empty string (z.string().min(1)) rather than trusted as already well-formed.
  from: read-case.dto.ts's own readCaseParamsSchema and list-cases's own sibling convention — every :slug-bearing
    route in this codebase requires it non-empty.
- inferred: an absent offset defaults to 0; an absent limit defaults to a configured defaultLimit; a limit above
    a configured maxLimit is clamped down to it rather than refused.
  from: the same API-04 inference list-cases-route's own delivery record already discloses, carried here unchanged
    for this sibling route.
preserved:
- Every existing ICaseQuery/CaseQueryService method's own behavior and signature — listCaseVersions is additive
  only.
- read-case.routes.ts's own :slug validation and CaseNotFoundError-propagation convention, mirrored rather than
  altered.
deferred:
- what: registering createListCaseVersionsRoutesPlugin into build-app.ts.
  why: task/case-lifecycle-http/register-routes-in-build-app owns aggregating every one of the initiative's eighteen
    route plugins.
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the new listCaseVersions store operation.

## Notes

None.
