---
title: POST /v1/cases/{slug}/hypotheses
summary: A thin Fastify plugin, controller and Zod DTO exposing the existing ReviseHypothesisOperation over HTTP, narrowed
  to CaseLifecycleOperations['reviseHypothesis'] — with a genuine defect in already-delivered domain code discovered and disclosed
  rather than papered over (see criterion 3).
task: sha256:6ab0fc68625f322b74a0589d6cf602c3b62e2529cd83612083b610f0f438e21c
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/hypothesis-manifest-batch-suite
files:
- path: src/http/dto/revise-hypothesis.dto.ts
  effect: declares reviseHypothesisParamsSchema (:slug alone) and reviseHypothesisBodySchema (hypothesis_name, criterion,
    collects, resolution, subject).
- path: src/http/revise-hypothesis.controller.ts
  effect: handleReviseHypothesisRequest combines the path's :slug with the validated body into ReviseHypothesisInput and hands
    it to CaseLifecycleOperations['reviseHypothesis'], answering with the resulting RevisedHypothesis unchanged.
- path: src/http/revise-hypothesis.routes.ts
  effect: registers POST /v1/cases/:slug/hypotheses, validates :slug then the body via Zod before the controller runs, answers
    201 with the RevisedHypothesis on success, and leaves every domain refusal to propagate uncaught.
criteria:
- criterion: A valid request naming a new or existing hypothesis persists a new hypothesis-revision with its criterion, collects
    and resolution.
  met: true
  how: the controller hands hypothesis_name, criterion, collects, resolution and subject to reviseHypothesis alongside the
    path's slug; ReviseHypothesisOperation runs its own three checks and delegates the identity-claim and numbering decision
    to ICaseStore.insertHypothesisRevision, which originates the hypothesis's own identity row only the first time this case
    uses its name and numbers the new revision one past its own highest existing one. The route answers 201 with the resulting
    RevisedHypothesis unchanged.
- criterion: A request whose body fails the Zod DTO validation is refused before the domain operation runs.
  met: true
  how: reviseHypothesisParamsSchema and reviseHypothesisBodySchema both run via safeParse before handleReviseHypothesisRequest
    is ever called; a failing parse answers 400 with the validation envelope, and reviseHypothesis is never invoked.
- criterion: A request naming a case slug that does not exist is refused with the status status-map assigns CaseNotFoundError.
  met: false
  how: criterion 3 is NOT met by the current call graph, and this is disclosed rather than forced. revise-hypothesis.operation.ts's
    own refuseWithoutDraft calls ICaseStore.findDraftVersion(slug), which returns undefined both for a slug the "cases" table
    holds no row for at all and for an existing case currently holding no draft — both throw CaseHoldsNoDraftError, never
    CaseNotFoundError. CaseHoldsNoDraftError carries no entry in src/errors/status-map.ts (whose table covers exactly the
    seven errors this epic's own inventory names, CaseNotFoundError among them but not this one), so error-handler.middleware.ts's
    generic fallback (500 INTERNAL_ERROR) is what a nonexistent-slug request against this route actually receives today, not
    the 404 status-map.ts assigns CaseNotFoundError. This task's own Notes asserted the refusal needed no new pre-check because
    the existing operation's callers 'already raise it for this exact absence' — traced and found false. No pre-check was
    added here (adding one would mean deciding, inside this route, a case-identity check the task's own Notes did not anticipate
    needing, and doing so silently would risk duplicating or diverging from whatever a proper fix decides); no domain file
    was modified (revise-hypothesis.operation.ts is read-only precedent, not this task's own file); status-map.ts was not
    extended (it is a different, already-delivered task's own record, and CaseHoldsNoDraftError mapping to some status still
    would not make the operation raise CaseNotFoundError as this criterion's literal wording requires). The mismatch is left
    for a human to settle through a corrective task, per this project's own procedure for a defect discovered in already-delivered
    code.
nodes:
- node: contracts/knowledge/case-lifecycle
  how: exposes the revise-hypothesis operation over HTTP, unchanged.
  encoded_at:
  - src/http/revise-hypothesis.routes.ts
  - src/http/revise-hypothesis.controller.ts
  - src/http/dto/revise-hypothesis.dto.ts
- node: domain/knowledge/case
  how: the route's own :slug is this aggregate's identity, validated for shape and read straight through to the operation.
  encoded_at:
  - src/http/dto/revise-hypothesis.dto.ts
  - src/http/revise-hypothesis.controller.ts
- node: domain/knowledge/hypothesis
  how: hypothesis_name is this node's own stable identity attribute, required as a non-empty string and passed through to
    the operation's own identity-claim-or-revise decision.
  encoded_at:
  - src/http/dto/revise-hypothesis.dto.ts
- node: domain/knowledge/hypothesis-revision
  how: criterion, collects and resolution are this node's own declared attributes; the body schema validates their shape and
    passes them straight to the operation. revision itself is never accepted from the request — it is the store's own assigned
    counter, answered back unchanged.
  encoded_at:
  - src/http/dto/revise-hypothesis.dto.ts
- node: domain/knowledge/resolution
  how: resolutionSchema mirrors this node's own outcome-plus-referral pairing, the same nested shape every sibling DTO already
    keeps.
  encoded_at:
  - src/http/dto/revise-hypothesis.dto.ts
inferences:
- inferred: a successful request answers 201 Created with the operation's own RevisedHypothesis unchanged, rather than reading
    any whole resource back.
  from: no node names a response shape or status for this operation; create-draft-route's own reasoning that a route whose
    successful call originates a new resource answers 201 applies identically here, since a valid revise-hypothesis request
    always originates a new hypothesis-revision row.
- inferred: collects is validated at the DTO boundary as an array of non-empty strings only, never required non-empty as a
    whole.
  from: update-draft.dto.ts's own convention that a business rule the domain operation already enforces with its own typed,
    contextful error is left to that operation rather than re-enforced generically at the DTO layer — rules/knowledge/a-hypothesis-collects-at-least-one-concept
    is exactly such a rule, already enforced by reviseHypothesis's own refuseEmptyCollects.
- inferred: this route's own path carries no :version segment.
  from: the task's own title and its REMAINDER note that revise-hypothesis originates independent of any case version's manifest
    or release state.
preserved:
- Every existing route's own API_PREFIX and shared-error-handler propagation convention, mirrored rather than altered.
- revise-hypothesis.operation.ts and case-lifecycle.factory.ts's CaseLifecycleOperations['reviseHypothesis'] — read-only for
  this task, left unmodified even though criterion 3's own gap traces into the former.
deferred:
- what: wiring createReviseHypothesisRoutesPlugin into build-app.ts.
  why: task/case-lifecycle-http/register-routes-in-build-app owns aggregating every one of the initiative's route plugins
    into the running app.
- what: 'resolving criterion 3''s gap: revise-hypothesis.operation.ts''s own refuseWithoutDraft cannot distinguish a nonexistent
    case slug from an existing case holding no draft, and status-map.ts carries no entry for CaseHoldsNoDraftError.'
  why: settling it means either changing revise-hypothesis.operation.ts's own refusal (read-only precedent, a different initiative's
    file) or extending status-map.ts (a different already-delivered task's own record) — both a human's to authorize, through
    a corrective task, not this route's own to invent silently.
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the existing reviseHypothesis operation — with one criterion honestly recorded unmet.

## Notes

None.
