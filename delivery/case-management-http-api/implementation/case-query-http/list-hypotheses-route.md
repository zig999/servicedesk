---
title: GET /v1/cases/{slug}/hypotheses
summary: A thin Fastify plugin, controller and Zod DTO over the new listHypotheses store operation, reached through
  ICaseQuery/CaseQueryService's own new pass-through.
task: sha256:73e08caf3aafeb1f50cf2cb79a3a07472b299878463985efa92341a94a7ccdc2
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/list-route-batch-suite-2
files:
- path: src/case/case-query.port.ts
  effect: 'adds listHypotheses(slug, pagination): Promise<PaginatedResponse<HypothesisIdentity>> to ICaseQuery.'
- path: src/case/case-query.service.ts
  effect: CaseQueryService.listHypotheses is a bare pass-through onto ICaseStore.listHypotheses; the store itself
    raises CaseNotFoundError for an unknown slug, neither caught nor re-raised here.
- path: src/http/dto/list-hypotheses.dto.ts
  effect: declares listHypothesesParamsSchema (:slug, non-empty) and listHypothesesQuerySchema (offset/limit, optional,
    coerced).
- path: src/http/list-hypotheses.controller.ts
  effect: handleListHypothesesRequest resolves pagination (offset default 0, limit default/clamp against defaultLimit/maxLimit)
    then calls ICaseQuery.listHypotheses(slug, pagination).
- path: src/http/list-hypotheses.routes.ts
  effect: createListHypothesesRoutesPlugin registers GET /v1/cases/:slug/hypotheses, validating :slug and the query
    string before the controller runs, leaving CaseNotFoundError to propagate uncaught.
criteria:
- criterion: A valid request against an existing slug returns a paginated page of every hypothesis that case holds.
  met: true
  how: the route delegates to handleListHypothesesRequest, which calls ICaseQuery.listHypotheses(slug, pagination)
    — a bare pass-through onto the already-delivered ICaseStore.listHypotheses (case-scoped, never version-scoped)
    — and answers its resolved page unchanged.
- criterion: A request naming a slug that does not exist is refused with the status status-map assigns CaseNotFoundError.
  met: true
  how: the store's own requireCaseIdentity throws CaseNotFoundError for an unknown slug before any hypothesis row
    is read; the service, controller and route add no catch of their own, so it reaches error-handler.middleware.ts
    unchanged, which status-map.ts already resolves.
nodes:
- node: contracts/knowledge/case-query
  how: exposes the contract's list-hypotheses operation over HTTP, unchanged.
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-query.service.ts
  - src/http/list-hypotheses.routes.ts
  - src/http/list-hypotheses.controller.ts
  - src/http/dto/list-hypotheses.dto.ts
- node: domain/knowledge/case
  how: the route resolves the case identity the :slug path segment names, refusing CaseNotFoundError where it names
    nothing stored.
  encoded_at:
  - src/http/dto/list-hypotheses.dto.ts
- node: domain/knowledge/hypothesis
  how: the response's data items carry HypothesisIdentity's own bare-name listing shape — case membership scoped
    to the case as a whole, never to one version's own manifest.
  encoded_at:
  - src/case/case-query.port.ts
- node: constraints/a-case-is-read-whole
  how: honored rather than encoded — this listing does not exercise the whole-case-for-diagnosis clause, which belongs
    to read-case-route, already delivered.
  encoded_at:
  - src/case/case-query.service.ts
inferences:
- inferred: :slug is validated as a non-empty string (z.string().min(1)) rather than trusted as already well-formed.
  from: read-case.dto.ts's own readCaseParamsSchema and this epic's own sibling :slug convention, already established
    for list-case-versions-route.
- inferred: an absent offset defaults to 0; an absent limit defaults to a configured defaultLimit; a limit above
    a configured maxLimit is clamped down to it rather than refused.
  from: the same API-04 inference list-cases-route's own delivery record already discloses, carried here unchanged
    for this sibling route.
preserved:
- Every existing ICaseQuery/CaseQueryService method's own behavior and signature — listHypotheses is additive only.
- list-case-versions.routes.ts's own :slug validation and CaseNotFoundError-propagation convention, mirrored rather
  than altered.
deferred:
- what: registering createListHypothesesRoutesPlugin into build-app.ts.
  why: task/case-lifecycle-http/register-routes-in-build-app owns aggregating every one of the initiative's eighteen
    route plugins.
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the new listHypotheses store operation.

## Notes

None.
