---
title: PUT /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name}
summary: A thin Fastify plugin, controller and Zod DTO exposing the existing placeHypothesis case-lifecycle operation over
  HTTP, answering 204 with no body since the operation itself answers void.
task: sha256:33f5def7dcb808289e30b17736ca7453c37ecd4d828377e8b91d7f5110cbb659
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/hypothesis-manifest-batch-suite
files:
- path: src/http/dto/place-hypothesis.dto.ts
  effect: declares placeHypothesisParamsSchema (:slug/:version coerced/:hypothesis_name) and placeHypothesisBodySchema ({revision,
    position}, both required positive ints).
- path: src/http/place-hypothesis.controller.ts
  effect: handlePlaceHypothesisRequest assembles path+body into a PlaceHypothesisInput and calls the narrowed CaseLifecycleOperations['placeHypothesis']
    dependency, answering void.
- path: src/http/place-hypothesis.routes.ts
  effect: createPlaceHypothesisRoutesPlugin registers PUT /v1/cases/:slug/versions/:version/manifest/:hypothesis_name under
    API_PREFIX, validating params then body via Zod before the controller runs, answering 204 with no body on success and
    leaving CaseVersionNotDraftError/ManifestPositionOccupiedError to propagate uncaught.
criteria:
- criterion: A valid request against a draft version places the named hypothesis's stated revision at the stated manifest
    position.
  met: true
  how: the controller forwards {slug, version, hypothesis_name, revision, position} unchanged to placeHypothesis, which manifest-composition.operations.ts's
    own logic performs the adoption against the real store; the route answers 204 with a wholly empty body, empirically verified.
- criterion: A request against a released version is refused with the status status-map assigns the a-case-version-is-written-once
    refusal.
  met: true
  how: placeHypothesis's own requireDraftVersion check throws CaseVersionNotDraftError before any write where the version's
    state is not draft; left uncaught, resolved to the status status-map.ts already assigns it (409).
- criterion: A request naming a manifest position already occupied is refused with the status status-map assigns ManifestPositionOccupiedError.
  met: true
  how: placeHypothesis's own refuseOccupiedByAnother check throws ManifestPositionOccupiedError before any write; left uncaught,
    resolved to the status status-map.ts already assigns it (409).
nodes:
- node: contracts/knowledge/case-lifecycle
  how: exposes the place-hypothesis operation over HTTP, unchanged.
  encoded_at:
  - src/http/place-hypothesis.routes.ts
  - src/http/place-hypothesis.controller.ts
- node: domain/knowledge/case-version
  how: the route identifies which version to place into (:version); the version's own draft-state gate is left entirely to
    the already-composed domain operation.
  encoded_at:
  - src/http/place-hypothesis.routes.ts
- node: domain/knowledge/case-version-state
  how: honored rather than encoded — the draft-state read and comparison live in manifest-composition.operations.ts, outside
    this task's own files.
  encoded_at:
  - src/http/place-hypothesis.routes.ts
- node: domain/knowledge/hypothesis
  how: hypothesis_name is validated as a path segment and passed through unchanged to the domain operation, identifying which
    hypothesis's revision is placed.
  encoded_at:
  - src/http/dto/place-hypothesis.dto.ts
- node: domain/knowledge/hypothesis-revision
  how: the body's revision field is this node's own numbered-content attribute, validated as a required positive integer and
    carried through unchanged.
  encoded_at:
  - src/http/dto/place-hypothesis.dto.ts
- node: domain/knowledge/manifest-entry
  how: the body's position field is this node's own precedence-position attribute, validated as a required positive integer
    and carried through unchanged.
  encoded_at:
  - src/http/dto/place-hypothesis.dto.ts
- node: rules/knowledge/a-case-version-is-written-once
  how: honored rather than encoded — the refusal is placeHypothesis's own guard (CaseVersionNotDraftError); this route only
    leaves it uncaught.
  encoded_at:
  - src/http/place-hypothesis.routes.ts
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  how: honored rather than encoded — the refusal is placeHypothesis's own guard (ManifestPositionOccupiedError); this route
    only leaves it uncaught.
  encoded_at:
  - src/http/place-hypothesis.routes.ts
inferences:
- inferred: a valid request answers 204 with no body, rather than reading the placed version back the way update-draft-route
    and release-route do.
  from: the task's own three criteria state only that the placement happens and that the two refusals map to the statuses
    status-map assigns — neither requires a response body, unlike update-draft's and release's own criterion 1 which explicitly
    required the resulting version to come back; discard-route's own void-operation, no-read-after-write, 204 convention is
    the precedent followed instead, since placeHypothesis answers void the same way discard does.
- inferred: the body's revision and position fields are validated as positive integers, not merely integers.
  from: neither domain/knowledge/hypothesis-revision nor domain/knowledge/manifest-entry states a lower bound, but every sibling
    DTO in this codebase applies .positive() to the structurally identical version field, and both a revision number and a
    manifest position are 1-based in every integration test this codebase already exercises.
preserved:
- Every existing route's own API_PREFIX and shared-error-handler propagation convention, mirrored rather than altered.
- case-store.port.ts's PlaceHypothesisInput, manifest-composition.operations.ts's placeHypothesis, and case-lifecycle.factory.ts's
  CaseLifecycleOperations['placeHypothesis'] — read-only for this task.
deferred:
- what: wiring createPlaceHypothesisRoutesPlugin into build-app.ts.
  why: task/case-lifecycle-http/register-routes-in-build-app owns aggregating every one of the initiative's route plugins
    into the running app.
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the existing placeHypothesis operation, answering 204 with no body.

## Notes

None.
