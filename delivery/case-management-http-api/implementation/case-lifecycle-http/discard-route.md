---
title: DELETE /v1/cases/{slug}/versions/{version}
summary: A thin Fastify plugin, controller and Zod DTO wired to the existing discard case-lifecycle operation — the first
  use of HTTP 204 No Content in this codebase's HTTP surface.
task: sha256:bc990abdb4ceb45452b875be33465df9c1482b1e67e04385b3feb252e3012834
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/create-draft-batch-suite
files:
- path: src/http/dto/discard.dto.ts
  effect: declares discardParamsSchema (:slug/:version, mirroring update-draft.dto.ts's own coercion) — no body schema, since
    discard takes no request body.
- path: src/http/discard.controller.ts
  effect: handleDiscardRequest calls CaseLifecycleOperations['discard'](slug, version) and answers nothing — no read-back,
    since discard's own result is void and this task's own criterion 1 requires no content in the response.
- path: src/http/discard.routes.ts
  effect: createDiscardRoutesPlugin registers DELETE /v1/cases/:slug/versions/:version under API_PREFIX, validating params
    via Zod before the controller runs, answering 204 with an empty body on success and leaving CaseVersionNotDraftError/CaseNotFoundError
    to propagate uncaught.
criteria:
- criterion: A valid DELETE request against a draft version removes it and answers with no content.
  met: true
  how: the controller calls discard, and the route answers reply.code(204).send() with an empty body, empirically verified.
- criterion: A DELETE request against a released version is refused with the status status-map assigns the a-case-version-is-written-once
    refusal.
  met: true
  how: discard throws CaseVersionNotDraftError before its own discard() primitive is ever reached; left uncaught, resolved
    to the status status-map.ts already assigns it (409).
- criterion: A DELETE request naming a slug or version that does not exist is refused with the status status-map assigns CaseNotFoundError.
  met: true
  how: discard throws CaseNotFoundError for an absent (slug, version) — checked before its own state guard, per discard.operation.ts's
    own ordering; left uncaught, resolved to the status status-map.ts already assigns it (404).
nodes:
- node: contracts/knowledge/case-lifecycle
  how: exposes the discard operation over HTTP, unchanged.
  encoded_at:
  - src/http/discard.routes.ts
  - src/http/discard.controller.ts
  - src/http/dto/discard.dto.ts
- node: domain/knowledge/case-version
  how: the named version is removed outright rather than corrected; nothing is read back, since discard answers void.
  encoded_at:
  - src/http/discard.controller.ts
- node: domain/knowledge/case
  how: honored rather than encoded — the identity row's own survival across a discard is decided by the already-delivered
    store operation, not this route.
  encoded_at:
  - src/http/discard.routes.ts
- node: domain/knowledge/case-version-state
  how: honored rather than encoded — the draft-only guard is discard's own check; this route only propagates its refusal.
  encoded_at:
  - src/http/discard.routes.ts
- node: rules/knowledge/a-case-version-is-written-once
  how: honored rather than encoded — the refusal against an already-released version is discard's own guard (CaseVersionNotDraftError);
    this route only leaves it uncaught.
  encoded_at:
  - src/http/discard.routes.ts
inferences:
- inferred: the success response is 204 No Content with a wholly empty body — the first use of that status in this codebase's
    HTTP surface.
  from: standard HTTP semantics for a DELETE that removed its resource and has nothing left to describe, and discardCaseVersion's
    own void result leaving nothing to project onto a response DTO.
- inferred: the controller depends on CaseLifecycleOperations['discard'] narrowed to that one function alone, rather than
    on ICaseStore directly.
  from: case-lifecycle.factory.ts's own composition of the bare discardCaseVersion function, following ARC-01/ARC-02.
preserved:
- Every existing route's own API_PREFIX and shared-error-handler propagation convention, mirrored rather than altered.
deferred:
- what: wiring the discard operation and this route into build-app.ts and case-lifecycle.factory.ts.
  why: task/case-lifecycle-http/register-routes-in-build-app owns aggregating every one of the initiative's route plugins
    into the running app.
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the existing discard operation, answering 204 with no body.

## Notes

None.
