---
title: POST /v1/cases
summary: A thin Fastify plugin, controller and Zod DTO wired to the existing createDraft case-lifecycle operation — the first
  route in this initiative to originate a new resource rather than read or correct one already stored.
task: sha256:0be7700bef1e0c157482636e76a95c627628810746da832f7ae87f9a12f933f1
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/create-draft-batch-suite
files:
- path: src/http/dto/create-draft.dto.ts
  effect: 'declares createDraftBodySchema mirroring case-store.port.ts''s own CreateDraftInput exactly: slug, title, when_to_use,
    authored_at, subject and fallback required; consolidation_register and source_version independently optional.'
- path: src/http/create-draft.controller.ts
  effect: handleCreateDraftRequest passes the validated body straight to CaseLifecycleOperations['createDraft'] and answers
    with the resulting CreatedDraft unchanged — no slug-existence pre-check, honoring the task's own UNDERDETERMINED note.
- path: src/http/create-draft.routes.ts
  effect: createCreateDraftRoutesPlugin registers POST /v1/cases under API_PREFIX, validating the body via Zod before the
    controller runs, answering 201 on success and leaving CaseAlreadyHasDraftError to propagate uncaught.
criteria:
- criterion: A valid POST /v1/cases request returns the created case's slug and its first draft version.
  met: true
  how: the controller calls createDraft with the parsed body and answers 201 with the CreatedDraft it resolves — the slug
    and the version number the case's own durable counter assigned, unchanged.
- criterion: A POST /v1/cases request naming a slug that already has an open draft is refused with the status status-map assigns
    CaseAlreadyHasDraftError.
  met: true
  how: createDraft throws CaseAlreadyHasDraftError before this controller runs any check of its own; left uncaught, resolved
    to the status status-map.ts already assigns it (409).
- criterion: A request whose body fails the Zod DTO validation is refused before the domain operation runs.
  met: true
  how: createDraftBodySchema.safeParse runs before handleCreateDraftRequest is ever called; a failing parse answers 400 with
    the validation envelope naming every violated field, and createDraft is never reached.
nodes:
- node: contracts/knowledge/case-lifecycle
  how: exposes the create-draft operation over HTTP, unchanged.
  encoded_at:
  - src/http/create-draft.routes.ts
  - src/http/create-draft.controller.ts
  - src/http/dto/create-draft.dto.ts
- node: domain/knowledge/case
  how: 'the controller adds no slug-existence pre-check: an existing case with no open draft still reaches createDraft and
    still succeeds, originating that case''s own next draft — the reading this task''s own UNDERDETERMINED note requires and
    the wrong reading it rules out.'
  encoded_at:
  - src/http/create-draft.controller.ts
  - src/http/create-draft.routes.ts
- node: domain/knowledge/case-version
  how: createDraftBodySchema declares exactly this node's own required attributes (title, when_to_use, subject, fallback)
    plus authored_at, matching case-store.port.ts's own CreateDraftInput; consolidation_register stays a true optional, never
    defaulted here.
  encoded_at:
  - src/http/dto/create-draft.dto.ts
- node: rules/knowledge/a-case-has-at-most-one-draft
  how: honored rather than encoded — the refusal itself is createDraft's own guard (CaseAlreadyHasDraftError); this route
    only leaves it uncaught to reach the shared error handler.
  encoded_at:
  - src/http/create-draft.routes.ts
inferences:
- inferred: 'the response status is 201 Created rather than update-draft-route''s own 200: this is the first route in this
    codebase whose successful call originates a new resource (a new draft version) rather than reading one back or correcting
    one already stored in place.'
  from: standard HTTP semantics for a resource-creating POST, and the absence of any existing precedent route in this codebase
    that originates a resource to mirror instead.
- inferred: the controller depends on CaseLifecycleOperations['createDraft'] alone, narrowed from the full CaseLifecycleOperations
    surface, rather than on ICaseStore directly.
  from: case-lifecycle.factory.ts now exists and already composes CreateDraftOperation — unlike update-draft-route, which
    predated it and had no such precedent — so this task follows the established convention ARC-01/ARC-02 name.
preserved:
- Every existing route's own API_PREFIX and shared-error-handler propagation convention, mirrored rather than altered.
- read-case.dto.ts's own bare-string and nested-resolution schema shapes, reused in spirit for the body's own fields.
deferred:
- what: wiring the createDraft operation and this route into build-app.ts and case-lifecycle.factory.ts.
  why: task/case-lifecycle-http/register-routes-in-build-app owns aggregating every one of the initiative's route plugins
    into the running app.
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the existing createDraft operation.

## Notes

None.
