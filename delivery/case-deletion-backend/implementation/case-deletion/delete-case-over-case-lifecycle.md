---
target: backend
title: Delete a case over the case-lifecycle surface
summary: Wires ICaseStore.delete into a domain-level delete operation, a thin DELETE
  /v1/cases/:slug route, controller and dto, added to CaseLifecycleOperations and
  registered in build-app.ts.
task: sha256:7112e9753df13a259858e24a0cddfba60550586a40306367f2f3f3fe0fd8b8c3
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/case-deletion-delete-case-over-case-lifecycle-build-3
files:
- path: src/case/delete-case.operation.ts
  effect: New domain-level operation module; exports deleteCase(store, slug), a pass-through
    to ICaseStore.delete(slug), importing only the case-store port.
- path: src/http/dto/delete-case.dto.ts
  effect: New zod DTO; deleteCaseParamsSchema requires a non-empty slug path segment,
    with DeleteCaseParamsDto inferred from it.
- path: src/http/delete-case.controller.ts
  effect: New thin controller; handleDeleteCaseRequest calls dependencies.delete(params.slug)
    and returns nothing else.
- path: src/http/delete-case.routes.ts
  effect: New Fastify plugin registering DELETE /v1/cases/:slug; answers HTTP 400
    with code VALIDATION_ERROR and a non-empty details list when the path fails deleteCaseParamsSchema,
    otherwise calls the controller and answers reply.code(204).send().
- path: src/factories/case-lifecycle.factory.ts
  effect: 'Added a delete: (slug: string) => Promise<void> entry to CaseLifecycleOperations,
    wired in createCaseLifecycle to deleteCase(caseStore, slug).'
- path: src/factories/build-app.factory.ts
  effect: 'lifecycleDependencies now also returns a deleteCase: { delete: caseLifecycle.delete
    } entry, picked into BuildAppDependencies.'
- path: src/http/build-app.ts
  effect: Imports DeleteCaseControllerDependencies/createDeleteCaseRoutesPlugin, adds
    a deleteCase field to BuildAppDependencies, and appends createDeleteCaseRoutesPlugin(dependencies.deleteCase)
    to routePluginFactories.
- path: src/__tests__/unit/http/build-app.spec.ts
  effect: 'stubBuildAppDependencies gains a deleteCase: { delete: async () => undefined
    } stub entry, packed onto the existing releaseHypothesisRevision/discard line
    to stay under max-lines-per-function; no existing assertion changed.'
criteria:
- criterion: A delete request on the case-lifecycle surface naming a case that holds
    no case version is answered with HTTP 204 and an empty body.
  met: true
  how: The route's success path calls the controller then reply.code(204).send();
    the controller calls caseLifecycle.delete(slug), which reaches RelationalCaseStore.delete
    (sibling task), accepting when the case holds no version.
- criterion: A delete request on the case-lifecycle surface naming a case that holds
    a draft case version is answered with HTTP 409 reporting a CaseHoldsVersionsError
    whose details carry that slug.
  met: true
  how: The same call path reaches the store's refuseIfCaseHoldsVersions, which throws
    CaseHoldsVersionsError(slug) (sibling task, registered at 409 in status-map.ts).
- criterion: A delete request on the case-lifecycle surface naming a case that holds
    a released case version is answered with HTTP 409 reporting a CaseHoldsVersionsError
    whose details carry that slug.
  met: true
  how: refuseIfCaseHoldsVersions counts case_versions rows regardless of state, so
    a released version is refused identically to a draft one, through the same wiring
    this task adds.
- criterion: A delete request on the case-lifecycle surface naming a slug no case
    holds is answered with HTTP 404 reporting a CaseNotFoundError whose details carry
    that slug.
  met: true
  how: The store's requireCaseIdentity (sibling task) throws CaseNotFoundError(slug,
    NO_VERSION_NAMED) before the hold-versions check runs; its context carries the
    slug, reached unchanged through this task's route/controller/operation.
- criterion: A delete request whose slug path segment fails the route's declared shape
    is answered with HTTP 400 with error code VALIDATION_ERROR and a non-empty details
    list.
  met: true
  how: 'delete-case.routes.ts parses request.params with deleteCaseParamsSchema.safeParse;
    on failure it answers { error: { code: ''VALIDATION_ERROR'', message, details:
    issues } } at 400.'
- criterion: After an accepted delete, the case listing holds no entry for the deleted
    slug.
  met: true
  how: The store's delete removes the cases row inside its transaction (sibling task);
    the existing case listing query reads that same table.
- criterion: After an accepted delete of a case whose hypotheses included a released
    hypothesis-revision with a collect, no hypothesis, hypothesis-revision or collect
    of that case remains.
  met: true
  how: The store's deleteVersionlessCase deletes hypothesis_revision_collects, hypothesis_revisions
    and hypotheses rows for the slug before deleting the cases row (sibling task);
    this task only wires the HTTP surface onto that same call.
- criterion: After an accepted delete, a create-draft naming the deleted slug creates
    a case version numbered 1.
  met: true
  how: Delete removes the cases row entirely, so create-draft's existing path reads
    the slug as held by no case and creates a new case with version 1.
- criterion: After an accepted delete and a create-draft naming the deleted slug,
    that case's next_version stands at 2.
  met: true
  how: create-draft's existing, unmodified logic leaves next_version at 2 for a case
    it originates.
- criterion: After an accepted delete and a create-draft naming the deleted slug,
    the case listing holds exactly one entry for that slug.
  met: true
  how: The deleted case's row is gone and create-draft writes exactly one new cases
    row under that slug, so the listing shows one entry.
- criterion: The delete operation's domain module imports no framework, driver or
    provider client package.
  met: true
  how: src/case/delete-case.operation.ts imports only type { ICaseStore } from ./case-store.port.js;
    no fastify, pg, jose, zod, pino or SDK import appears in it.
nodes:
- node: rules/knowledge/a-case-holding-no-version-may-be-deleted
  encoded_at:
  - src/case/delete-case.operation.ts
  - src/http/delete-case.routes.ts
  - src/factories/case-lifecycle.factory.ts
  how: This task builds the HTTP-to-domain surface that lets a curator reach the store's
    existing acceptance/refusal for this rule; the acceptance and cascading-delete
    logic itself was delivered by the sibling task.
- node: constraints/a-successful-case-deletion-answers-with-no-content
  encoded_at:
  - src/http/delete-case.routes.ts
  how: The route's accepted branch answers reply.code(204).send() with no body, exactly
    as the constraint states.
- node: scenarios/knowledge/a-case-holding-no-version-is-deleted
  encoded_at:
  - src/case/delete-case.operation.ts
  - src/http/delete-case.routes.ts
  - src/factories/case-lifecycle.factory.ts
  how: The given/when/then this scenario states is reached end-to-end once this task's
    route/controller/operation call the store's already-delivered delete.
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/factories/case-lifecycle.factory.ts
  - src/http/build-app.ts
  - src/http/delete-case.routes.ts
  how: delete is added as a CaseLifecycleOperations entry and registered in build-app.ts's
    routePluginFactories, publishing it alongside the contract's other listed operations.
- node: domain/knowledge/case
  encoded_at:
  - src/case/delete-case.operation.ts
  how: delete is one of the two operations this node's frontmatter names for the case
    aggregate; this task gives it its domain-level operation module.
- node: domain/knowledge/case-version
  how: Governs the precondition this task's wiring trusts entirely to the store's
    existing check; no fact of its own reaches this task's new code.
- node: domain/knowledge/hypothesis
  how: Governs why a hypothesis has no delete of its own and is instead removed as
    part of the case's deletion; the cascade was delivered by the sibling task.
- node: domain/knowledge/hypothesis-revision
  how: Same as domain/knowledge/hypothesis — governs the cascade this task's route
    reaches through the store, without adding a fact of its own.
- node: rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug
  how: Governs why a deleted slug is reclaimable by a later create-draft; this task
    changes nothing in create-draft's own path.
- node: rules/knowledge/a-slug-identifies-one-case
  how: Governs the invariant that continues to hold once a slug is freed by delete
    and later reclaimed; no fact newly encoded by this task.
- node: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  how: Per the task's own REMAINDER note, only the branch this rule already answers
    (no case holds the slug) is reached by delete, through the store's existing CaseNotFoundError.
- node: constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  how: Governs the vocabulary of CaseHoldsVersionsError's and CaseNotFoundError's
    messages, both already written by earlier deliveries; this task adds no new refusal
    message.
- node: constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
  how: Governs messages already written in Brazilian Portuguese by the errors' existing
    implementations; this task's route/controller carry them through unchanged.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  encoded_at:
  - src/http/delete-case.routes.ts
  how: The route answers a malformed slug path segment with HTTP 400, code VALIDATION_ERROR
    and a details list built from the zod issues.
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/case/delete-case.operation.ts
  how: The new domain operation module imports only the case-store port, no framework,
    driver or provider client package.
inferences:
- inferred: The new files are named with a delete-case prefix (delete-case.operation.ts,
    delete-case.controller.ts, delete-case.routes.ts, delete-case.dto.ts) rather than
    a bare delete or case prefix.
  from: The inventory's own note naming delete-case.operation.ts as a plausible candidate,
    and CON-01's kebab-case file-naming rule combined with the need to read distinctly
    from the already-used discard verb in the same directory.
- inferred: The route path is DELETE /v1/cases/:slug, with no sub-resource segment.
  from: The task's instruction to follow the whole-aggregate-delete pattern of src/http/remove-connector.routes.ts,
    which registers DELETE /v1/connectors/:connector for a whole-aggregate removal.
- inferred: BuildAppDependencies and lifecycleDependencies use the key deleteCase
    (not delete), while CaseLifecycleOperations and DeleteCaseControllerDependencies
    use the key delete (matching ICaseStore.delete).
  from: The existing pattern where the resources/dependencies bag in build-app.factory.ts
    already names every other lifecycle entry for its route (createDraft, updateDraft,
    release, discard) rather than the verb alone.
preserved:
- Every existing entry of routePluginFactories in src/http/build-app.ts, appended
  to rather than reordered or altered.
- Every existing entry of CaseLifecycleOperations and of createCaseLifecycle's returned
  object, unchanged besides the added delete entry.
- lifecycleDependencies' existing return entries in src/factories/build-app.factory.ts,
  unchanged besides the added deleteCase entry.
- The existing DELETE routes at /v1/cases/:slug/versions/:version and /v1/cases/:slug/versions/:version/manifest/:hypothesis_name,
  left untouched and non-conflicting with the new /v1/cases/:slug route.
---

## What it is

The domain-level delete operation and its HTTP route, controller and dto, wired into the case-lifecycle factory and the app.

## Notes

The first build attempt (run/case-deletion-delete-case-over-case-lifecycle-build) failed at typecheck: a pre-existing test fixture (stubBuildAppDependencies in src/__tests__/unit/http/build-app.spec.ts) did not declare the widened BuildAppDependencies' new deleteCase field; fixed by the test-authoring role with a minimal stub. The second attempt (build-2) failed at lint: the added line pushed that fixture's function over max-lines-per-function (31 lines, limit 30); fixed by packing the new entry onto an existing line, matching the file's own convention. The third attempt (build-3) passed clean; this record pins that run.
