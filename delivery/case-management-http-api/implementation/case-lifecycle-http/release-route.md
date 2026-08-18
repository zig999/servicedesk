---
title: POST /v1/cases/{slug}/versions/{version}/release
summary: A thin Fastify plugin, controller and Zod DTO wired to the existing release case-lifecycle operation, reading the
  released version back through the published case-query contract — the write-then-read pattern update-draft-route established.
task: sha256:e6c8c1812ed3f49226888d6932515cf2340ccaf4e86df4834d9825378247c58b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/create-draft-batch-suite
files:
- path: src/http/dto/release.dto.ts
  effect: declares releaseParamsSchema (:slug/:version, mirroring read-case.dto.ts's and update-draft.dto.ts's own coercion)
    — no body schema, since release takes no request body.
- path: src/http/release.controller.ts
  effect: handleReleaseRequest calls CaseLifecycleOperations['release'](slug, version), then ICaseQuery.readCase(slug, version)
    for the read-back, projecting through the already-exported toReadCaseResponse.
- path: src/http/release.routes.ts
  effect: createReleaseRoutesPlugin registers POST /v1/cases/:slug/versions/:version/release under API_PREFIX, validating
    params via Zod before the controller runs, answering 200 on success and leaving CaseVersionNotDraftAtReleaseError/CaseVersionNotReleasableError/CaseNotFoundError
    to propagate uncaught.
criteria:
- criterion: A valid release request against a draft version whose validator rules all answer returns the version now in released
    state.
  met: true
  how: the controller calls release first, then readCase to read the freshly released state back, and answers 200 with the
    projected shape read-case-route's own proof already asserts.
- criterion: A release request against a version already released is refused with the status status-map assigns.
  met: true
  how: release throws CaseVersionNotDraftAtReleaseError before any read-back is attempted; left uncaught, resolved to the
    status status-map.ts already assigns it (409).
- criterion: A release request against a version whose validator rules do not all answer returns every applicable refusal
    together, not only the first.
  met: true
  how: release throws CaseVersionNotReleasableError naming every violated rule together (the operation's own assembled-manifest
    validation, unchanged); left uncaught, resolved to the status status-map.ts already assigns it (422), with every named
    violation preserved in the response body.
nodes:
- node: contracts/knowledge/case-lifecycle
  how: exposes the release operation over HTTP, unchanged.
  encoded_at:
  - src/http/release.routes.ts
  - src/http/release.controller.ts
  - src/http/dto/release.dto.ts
- node: domain/knowledge/case-version
  how: read back and projected via toReadCaseResponse after a successful release, matching read-case-route's own wire shape.
  encoded_at:
  - src/http/release.controller.ts
- node: domain/knowledge/case-version-state
  how: honored rather than encoded — the transition to released state itself is release.operation.ts's own write; this route
    only propagates its refusals and reads the resulting state back.
  encoded_at:
  - src/http/release.routes.ts
  - src/http/release.controller.ts
- node: rules/knowledge/a-case-version-is-written-once
  how: honored rather than encoded — the refusal against an already-released version is release's own guard (CaseVersionNotDraftAtReleaseError);
    this route only leaves it uncaught.
  encoded_at:
  - src/http/release.routes.ts
inferences:
- inferred: the controller reads the version back via ICaseQuery.readCase after a successful release, the same write-then-read
    pattern update-draft-route established, rather than release answering its own projected shape.
  from: release.operation.ts's own IRelease.release signature answers void, never the released version, but this task's own
    criterion 1 requires the route to return the version now in released state — update-draft-route's own read-after-write
    via the same published readCase and toReadCaseResponse is the only established convention to mirror rather than invent
    a second one.
- inferred: the controller depends on CaseLifecycleOperations['release'] narrowed to that one function, plus ICaseQuery, rather
    than on ReleaseOperation or ICaseStore directly.
  from: case-lifecycle.factory.ts's own composition of ReleaseOperation, following ARC-01/ARC-02.
preserved:
- Every existing route's own API_PREFIX and shared-error-handler propagation convention, mirrored rather than altered.
- read-case.controller.ts's own toReadCaseResponse projection logic, reused via its existing export rather than duplicated.
deferred:
- what: wiring the release operation and this route into build-app.ts and case-lifecycle.factory.ts.
  why: task/case-lifecycle-http/register-routes-in-build-app owns aggregating every one of the initiative's route plugins
    into the running app.
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the existing release operation, reading the result back.

## Notes

None.
