---
title: PATCH /v1/cases/{slug}/versions/{version}
summary: A thin Fastify plugin, controller and Zod DTO wired to the new updateDraft store operation, reading the
  corrected version back through the published case-query contract — the first write route of this initiative.
task: sha256:9600013d7591c0abeb4595c90b1e37f7c41e41658bbecbb20a05f908305f9a08
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/update-draft-batch-suite-4
files:
- path: src/http/dto/update-draft.dto.ts
  effect: declares updateDraftParamsSchema (:slug/:version, mirroring read-case.dto.ts's own coercion) and updateDraftBodySchema
    (title, when_to_use, subject, fallback required; consolidation_register optional — a full-replacement body,
    not a partial patch).
- path: src/http/update-draft.controller.ts
  effect: handleUpdateDraftRequest calls ICaseStore.updateDraft(slug, version, body) then ICaseQuery.readCase(slug,
    version) for the read-back, projecting through the newly exported toReadCaseResponse.
- path: src/http/update-draft.routes.ts
  effect: createUpdateDraftRoutesPlugin registers PATCH /v1/cases/:slug/versions/:version under API_PREFIX, validating
    params then body via Zod before the controller runs, leaving CaseVersionNotDraftError/CaseNotFoundError to propagate
    uncaught.
- path: src/http/read-case.controller.ts
  effect: exports toReadCaseResponse (previously module-private) so this controller reuses the identical case-version
    wire projection instead of restating it (MNT-03) — no behavioral change, visibility only.
criteria:
- criterion: A valid PATCH request against a draft version updates its declared attributes and returns the updated
    version.
  met: true
  how: the controller calls ICaseStore.updateDraft first, then ICaseQuery.readCase to read the freshly written state
    back, and answers 200 with the projected shape read-case-route's own proof already asserts.
- criterion: A PATCH request against a released version is refused with the status status-map assigns the a-case-version-is-written-once
    refusal.
  met: true
  how: updateDraft throws CaseVersionNotDraftError before any read-back is attempted; left uncaught, resolved to
    the status status-map.ts already assigns it.
- criterion: A PATCH request naming a slug or version that does not exist is refused with the status status-map
    assigns CaseNotFoundError.
  met: true
  how: updateDraft throws CaseNotFoundError for an absent (slug, version); left uncaught, resolved to the status
    status-map.ts already assigns it.
nodes:
- node: contracts/knowledge/case-lifecycle
  how: exposes the update-draft operation over HTTP, unchanged.
  encoded_at:
  - src/http/update-draft.routes.ts
  - src/http/update-draft.controller.ts
  - src/http/dto/update-draft.dto.ts
- node: domain/knowledge/case-version
  how: updateDraftBodySchema declares exactly this node's own title/when_to_use/subject/fallback as required and
    consolidation_register as optional, matching the domain node's own required-field declarations.
  encoded_at:
  - src/http/dto/update-draft.dto.ts
- node: domain/knowledge/case-version-state
  how: honored rather than encoded here — the guard itself lives in the already-delivered store operation; this
    route only propagates its refusal.
  encoded_at:
  - src/http/update-draft.routes.ts
- node: domain/knowledge/resolution
  how: fallback is validated against the same nested outcome+referral schema read-case.dto.ts already declares,
    reused rather than restated.
  encoded_at:
  - src/http/dto/update-draft.dto.ts
- node: domain/knowledge/consolidation-register
  how: consolidation_register stays a true optional in the body schema — its absence keeps whatever register the
    store's own default holds, never defaulted here.
  encoded_at:
  - src/http/dto/update-draft.dto.ts
- node: rules/knowledge/a-case-version-is-written-once
  how: honored rather than encoded — the refusal itself is the store's own guard; this route only leaves it uncaught
    to reach the shared error handler.
  encoded_at:
  - src/http/update-draft.routes.ts
inferences:
- inferred: no write route existed anywhere in this initiative before this task — discard.operation.ts and release.operation.ts
    are domain-only orphans not yet reached by anything HTTP-facing — so the controller depends on ICaseStore directly
    (for updateDraft) plus ICaseQuery (for the read-back), both received as configured dependencies (ARC-01/ARC-02),
    mirroring the read-routes' own dependency-injection style.
  from: this task's own scope disclosed exactly this fallback for the no-precedent case; case-lifecycle.factory.ts's
    own CaseLifecycleOperations bundle exposes neither discard nor release to anything HTTP-facing yet, confirming
    no existing convention to follow instead.
- inferred: the body is a full-replacement PATCH — all four required fields resent every call — rather than a partial-field
    patch.
  from: domain/knowledge/case-version's own phrasing ('its own declared attributes may likewise be corrected') and
    the already-decided UpdateDraftInput port type, which the body schema mirrors rather than inventing a partial-patch
    alternative independently.
- inferred: the read-back after a successful write is performed via ICaseQuery.readCase — the same validated whole-case
    read read-case-route already performs — rather than a lighter dedicated read.
  from: no prior write route existed to mirror a read-after-write convention from; readCase was the only already-published,
    already-proved read this controller could reach without inventing a new seam.
preserved:
- Every existing route's own API_PREFIX and shared-error-handler propagation convention, mirrored rather than altered.
- read-case.controller.ts's own toReadCaseResponse projection logic, reused via export rather than duplicated.
deferred:
- what: wiring ICaseStore/ICaseQuery instances and this route into build-app.ts and case-lifecycle.factory.ts.
  why: task/case-lifecycle-http/register-routes-in-build-app owns aggregating every one of the initiative's route
    plugins into the running app.
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the new updateDraft store operation.

## Notes

None.
