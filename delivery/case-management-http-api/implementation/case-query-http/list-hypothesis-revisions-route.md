---
title: GET /v1/cases/{slug}/hypotheses/{name}/revisions
summary: A thin Fastify plugin, controller and Zod DTO over the new listHypothesisRevisions store operation, reached
  through ICaseQuery/CaseQueryService's own new pass-through.
task: sha256:4da9b91a07765d31ee3521143dbed56ef177d741bb5524786cd27a1b6ad9d21e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/list-route-batch-suite-2
files:
- path: src/case/case-query.port.ts
  effect: 'adds listHypothesisRevisions(slug, hypothesisName, pagination): Promise<PaginatedResponse<HypothesisRevisionListItem>>
    to ICaseQuery.'
- path: src/case/case-query.service.ts
  effect: CaseQueryService.listHypothesisRevisions is a bare pass-through onto ICaseStore.listHypothesisRevisions;
    the store collapses an unknown slug and an unknown hypothesis name under a known slug into the same CaseNotFoundError,
    disclosed here rather than re-decided.
- path: src/http/dto/list-hypothesis-revisions.dto.ts
  effect: declares listHypothesisRevisionsParamsSchema (:slug and :name, both non-empty) and listHypothesisRevisionsQuerySchema
    (offset/limit, optional, coerced).
- path: src/http/list-hypothesis-revisions.controller.ts
  effect: handleListHypothesisRevisionsRequest takes the parsed params object (never two loose strings, to keep
    the function within the standard's max-params rule) and the query, resolves pagination, then calls ICaseQuery.listHypothesisRevisions(params.slug,
    params.name, pagination).
- path: src/http/list-hypothesis-revisions.routes.ts
  effect: createListHypothesisRevisionsRoutesPlugin registers GET /v1/cases/:slug/hypotheses/:name/revisions, validating
    both path params and the query string before the controller runs, leaving CaseNotFoundError to propagate uncaught.
criteria:
- criterion: A valid request against an existing slug and hypothesis name returns a paginated page of every revision
    that hypothesis holds.
  met: true
  how: the route delegates to handleListHypothesisRevisionsRequest, which calls ICaseQuery.listHypothesisRevisions(slug,
    name, pagination) — a bare pass-through onto the already-delivered ICaseStore.listHypothesisRevisions — and
    answers its resolved page unchanged.
- criterion: A request naming a slug or hypothesis name that does not exist is refused with the status status-map
    assigns CaseNotFoundError.
  met: true
  how: the store's own existence check against the hypotheses table (case_slug, name) raises CaseNotFoundError for
    either an unknown slug or an unknown name under a known slug — the same single error either way, since a hypothesis
    row can only exist under a slug the cases table already holds; the service, controller and route add no catch
    of their own, so it reaches error-handler.middleware.ts unchanged.
nodes:
- node: contracts/knowledge/case-query
  how: exposes the contract's list-hypothesis-revisions operation over HTTP, unchanged.
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-query.service.ts
  - src/http/list-hypothesis-revisions.routes.ts
  - src/http/list-hypothesis-revisions.controller.ts
  - src/http/dto/list-hypothesis-revisions.dto.ts
- node: domain/knowledge/case
  how: the route resolves the case identity the :slug path segment names, refusing CaseNotFoundError where it names
    nothing stored.
  encoded_at:
  - src/http/dto/list-hypothesis-revisions.dto.ts
- node: domain/knowledge/hypothesis
  how: the route resolves the hypothesis the :name path segment names within that case, refusing CaseNotFoundError
    where it names nothing originated.
  encoded_at:
  - src/http/dto/list-hypothesis-revisions.dto.ts
- node: domain/knowledge/hypothesis-revision
  how: the response's data items carry HypothesisRevisionListItem's own already-decided full-content listing shape
    — revision, criterion, collects and resolution, never hypothesis_name, since the listing is already scoped to
    one named hypothesis.
  encoded_at:
  - src/case/case-query.port.ts
- node: constraints/a-case-is-read-whole
  how: honored rather than encoded — this listing does not exercise the whole-case-for-diagnosis clause, which belongs
    to read-case-route, already delivered.
  encoded_at:
  - src/case/case-query.service.ts
inferences:
- inferred: :slug and :name are each validated as a non-empty string (z.string().min(1)) rather than trusted as
    already well-formed, with no narrower URL-safe-character convention for a hypothesis name.
  from: read-case.dto.ts's :slug and read-vocabulary-term.dto.ts's own :name — the two existing precedents for these
    path-parameter classes, neither of which restricts to a narrower character set.
- inferred: the controller takes the parsed params object as one argument rather than slug and hypothesisName as
    two loose strings.
  from: 'the standard''s own max-params lint rule (ESLint max-params: 3), caught by the shared comprehensive suite''s
    lint step and fixed by collapsing the two path identifiers into the DTO object already carrying them.'
- inferred: CaseNotFoundError covers both an unknown slug and an unknown hypothesis name under a known slug, with
    no separate distinction at this route's own layer.
  from: the store's own existence check reads the hypotheses table by (case_slug, name) alone; that row can only
    exist for a case_slug the cases table already holds (a foreign key), so its absence collapses both cases into
    one refusal — the distinction, where it matters, is the store's own proof to draw, not this route's.
- inferred: an absent offset defaults to 0; an absent limit defaults to a configured defaultLimit; a limit above
    a configured maxLimit is clamped down to it rather than refused.
  from: the same API-04 inference list-cases-route's own delivery record already discloses, carried here unchanged
    for this sibling route.
preserved:
- Every existing ICaseQuery/CaseQueryService method's own behavior and signature — listHypothesisRevisions is additive
  only.
- list-hypotheses.routes.ts's own :slug validation and CaseNotFoundError-propagation convention, extended rather
  than altered for the added :name segment.
deferred:
- what: registering createListHypothesisRevisionsRoutesPlugin into build-app.ts.
  why: task/case-lifecycle-http/register-routes-in-build-app owns aggregating every one of the initiative's eighteen
    route plugins.
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the new listHypothesisRevisions store operation.

## Notes

None.
