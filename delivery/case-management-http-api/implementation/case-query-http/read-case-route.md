---
title: GET /v1/cases/{slug}/versions/{version}
summary: A thin Fastify route, controller and Zod DTO exposing the existing read-case domain operation
  over HTTP.
task: sha256:0ff1d88c91e115e347f6f5904d65628e5f4971c1dcc5f2433320b5691b93f695
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/read-routes-batch-suite-2
files:
- path: src/http/dto/read-case.dto.ts
  effect: declares readCaseParamsSchema (coerces :slug and :version off the URL) and readCaseResponseSchema
    — the wire shape of a case read whole, mirroring case and case-version, plus each manifest entry's
    own hypothesis-revision.
- path: src/http/read-case.controller.ts
  effect: exports handleReadCaseRequest, which calls ICaseQuery.readCase with the validated slug/version
    and projects the resolved Case onto the response DTO via toReadCaseResponse; adds no error-mapping
    logic.
- path: src/http/read-case.routes.ts
  effect: exports createReadCaseRoutesPlugin, registering GET /v1/cases/:slug/versions/:version under
    the API_PREFIX, validating params before calling handleReadCaseRequest.
criteria:
- criterion: A valid request returns the named case version assembled and validated whole — its own attributes,
    its manifest and every manifest entry's own hypothesis-revision.
  met: true
  how: handleReadCaseRequest calls ICaseQuery.readCase(slug, version), which case-query.service.ts already
    assembles and validates whole at the moment of reading before answering; toReadCaseResponse carries
    every declared attribute onto the response unchanged.
- criterion: A request naming a slug or version that does not exist is refused with the status status-map
    assigns CaseNotFoundError.
  met: true
  how: case-query.service.ts's own heldVersion throws CaseNotFoundError when store.assembleVersion answers
    undefined; the controller and route add no catch of their own, so it reaches error-handler.middleware.ts
    unchanged, which consults status-map.ts's own already-existing CaseNotFoundError → 404 entry.
- criterion: A request against a case version that cannot be assembled whole returns nothing rather than
    a partially assembled result.
  met: true
  how: the route performs exactly one readCase call and either answers its single fully-resolved result
    or lets whatever it threw (CaseNotFoundError or CaseNotValidError, both raised before any partial
    Case is ever returned) propagate to the shared error handler.
nodes:
- node: contracts/knowledge/case-query
  how: exposes the contract's read-case operation over HTTP, unchanged.
  encoded_at:
  - src/http/read-case.routes.ts
  - src/http/read-case.controller.ts
  - src/http/dto/read-case.dto.ts
- node: domain/knowledge/case
  how: readCaseResponseSchema's slug field carries the case's own stable identity onto the wire; next_version
    is not answered by this read.
  encoded_at:
  - src/http/dto/read-case.dto.ts
  - src/http/read-case.controller.ts
- node: domain/knowledge/case-version
  how: readCaseResponseSchema declares every one of this node's own attributes, carried through unchanged.
  encoded_at:
  - src/http/dto/read-case.dto.ts
  - src/http/read-case.controller.ts
- node: domain/knowledge/manifest-entry
  how: manifestEntrySchema mirrors this node's own two facts — precedence position and one referenced
    hypothesis-revision.
  encoded_at:
  - src/http/dto/read-case.dto.ts
- node: domain/knowledge/hypothesis-revision
  how: hypothesisRevisionSchema declares the hypothesis identity, revision, criterion, collects and resolution
    this node states.
  encoded_at:
  - src/http/dto/read-case.dto.ts
- node: domain/knowledge/resolution
  how: resolutionSchema pairs one outcome with its referral exactly as this node requires, reused for
    both fallback and every hypothesis-revision's resolution.
  encoded_at:
  - src/http/dto/read-case.dto.ts
- node: constraints/a-case-is-read-whole
  how: honored rather than encoded — this route adds no path that could answer a partial case; the wholeness
    guarantee itself lives in case-query.service.ts, delivered by an earlier task.
inferences:
- inferred: the response DTO excludes Case.hypotheses, the flattened per-version projection judgment-stage.ts
    and its siblings consume.
  from: case.ts's own header comment stating that projection is never independently declared; no domain
    node declares hypotheses as an attribute, only manifest.
- inferred: ''':version'' is coerced from its URL string with z.coerce.number().int().positive() rather
    than trusted as already numeric.'
  from: src/config/env.ts's own established coercion convention and diagnose.dto.ts's own caseRefSchema.
- inferred: manifest position and hypothesis-revision revision are validated as plain integers with no
    positivity lower bound.
  from: domain/knowledge/manifest-entry and domain/knowledge/hypothesis-revision each state only integer/required,
    no lower bound, unlike a case version's own positivity.
- inferred: the response schema's manifest and collects arrays are declared with Zod's own .readonly().
  from: case.ts's own type declarations, where every array field is readonly.
preserved:
- case-query.service.ts's own CaseQueryService.readCase behavior — the assembled-whole read, its CaseNotFoundError
  and CaseNotValidError refusals.
- error-handler.middleware.ts and status-map.ts's own existing CaseNotFoundError → 404 mapping, consulted
  unchanged.
- diagnose.routes.ts's and build-app.ts's own existing single-route registration, untouched.
- read-capability.routes.ts's own established thin-plugin/controller/DTO shape, mirrored rather than altered.
deferred:
- what: registering createReadCaseRoutesPlugin into build-app.ts.
  why: task/case-lifecycle-http/register-routes-in-build-app owns aggregating every one of the initiative's
    eighteen route plugins; reaching into build-app.ts here would touch a shared file that task owns.
- what: any pagination, filtering or listing behavior over case versions, hypotheses or their revisions.
  why: belongs to this epic's own separate list-* tasks.
---

## What it is

A thin Fastify plugin, controller and Zod DTO wired to the existing read-case domain operation.

## Notes

None.
