---
title: DELETE /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name}
summary: A thin Fastify plugin, controller and Zod DTO exposing the existing removeHypothesis case-lifecycle operation over
  HTTP, mirroring discard-route's own empty-body convention.
task: sha256:ec0800d4bad1edd3578a701fd6efdd780ea777db16c9d15590a30d004ec8305a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/hypothesis-manifest-batch-suite
files:
- path: src/http/dto/remove-hypothesis.dto.ts
  effect: declares removeHypothesisParamsSchema (slug, coerced version, hypothesis_name) validating the route's three path
    parameters — no body schema.
- path: src/http/remove-hypothesis.controller.ts
  effect: declares RemoveHypothesisControllerDependencies (narrowed to CaseLifecycleOperations['removeHypothesis']) and handleRemoveHypothesisRequest,
    forwarding the parsed params straight to the published operation and answering nothing.
- path: src/http/remove-hypothesis.routes.ts
  effect: registers DELETE /v1/cases/:slug/versions/:version/manifest/:hypothesis_name, validates the path via Zod before
    the controller runs, and answers 204 with no body once it resolves, leaving ManifestWouldHoldNoHypothesisError/CaseVersionNotDraftError
    to propagate uncaught.
criteria:
- criterion: A valid request against a draft version removes the named hypothesis's manifest entry.
  met: true
  how: handleRemoveHypothesisRequest forwards the parsed slug/version/hypothesis_name straight to removeHypothesis, which
    manifest-composition.operations.ts's own logic scopes to a draft version before deleting the named entry; the route answers
    204 with a wholly empty body, empirically verified.
- criterion: A request that would leave the manifest holding no hypothesis is refused with the status status-map assigns ManifestWouldHoldNoHypothesisError.
  met: true
  how: removeHypothesis's own refuseEmptiedManifest check throws ManifestWouldHoldNoHypothesisError before any write; left
    uncaught, resolved to the status status-map.ts already assigns it (422).
- criterion: A request against a released version is refused with the status status-map assigns the a-case-version-is-written-once
    refusal.
  met: true
  how: removeHypothesis's own requireDraftVersion check throws CaseVersionNotDraftError before any write where the version's
    state is not draft; left uncaught, resolved to the status status-map.ts already assigns it (409).
nodes:
- node: contracts/knowledge/case-lifecycle
  how: exposes the remove-hypothesis operation over HTTP, unchanged.
  encoded_at:
  - src/http/remove-hypothesis.routes.ts
  - src/http/remove-hypothesis.controller.ts
  - src/http/dto/remove-hypothesis.dto.ts
- node: domain/knowledge/case-version
  how: the controller calls the version's own remove-hypothesis operation by slug and version, never touching any other of
    the aggregate's attributes.
  encoded_at:
  - src/http/remove-hypothesis.controller.ts
- node: domain/knowledge/manifest-entry
  how: hypothesis_name is the path segment naming which manifest entry (by the hypothesis it composes) is removed; the DTO
    carries no position or revision field, since removal identifies the entry by hypothesis name alone.
  encoded_at:
  - src/http/dto/remove-hypothesis.dto.ts
- node: domain/knowledge/case-version-state
  how: honored rather than encoded — the draft/released distinction is enforced entirely inside removeHypothesis; this route
    only propagates its refusal.
  encoded_at:
  - src/http/remove-hypothesis.routes.ts
- node: rules/knowledge/a-case-version-is-written-once
  how: honored rather than encoded — the refusal is removeHypothesis's own guard (CaseVersionNotDraftError); this route only
    leaves it uncaught.
  encoded_at:
  - src/http/remove-hypothesis.routes.ts
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  how: honored rather than encoded — the refusal is removeHypothesis's own guard (ManifestWouldHoldNoHypothesisError); this
    route only leaves it uncaught.
  encoded_at:
  - src/http/remove-hypothesis.routes.ts
inferences:
- inferred: the success response is 204 No Content with a wholly empty body, mirroring discard-route's own established convention
    exactly.
  from: removeHypothesis's own void result and this task's own criterion 1 requiring no content beyond the removal itself,
    the same reasoning discard-route's own delivery record already discloses.
- inferred: the controller depends on CaseLifecycleOperations['removeHypothesis'] narrowed to that one function alone, rather
    than on ICaseStore directly.
  from: case-lifecycle.factory.ts's own composition of the bare removeHypothesis function, following ARC-01/ARC-02.
preserved:
- Every existing route's own API_PREFIX and shared-error-handler propagation convention, mirrored rather than altered.
- manifest-composition.operations.ts's removeHypothesis and case-lifecycle.factory.ts's CaseLifecycleOperations['removeHypothesis']
  — read-only for this task.
deferred:
- what: wiring createRemoveHypothesisRoutesPlugin into build-app.ts.
  why: task/case-lifecycle-http/register-routes-in-build-app owns aggregating every one of the initiative's route plugins
    into the running app.
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the existing removeHypothesis operation, answering 204 with no body.

## Notes

None.
