---
title: Case deletion — existing case-lifecycle backend shape
summary: Inventory of the case aggregate's HTTP-to-repository lifecycle path that
  a delete operation must slot into.
sources:
- work/case-deletion-backend/intake/scope.md
area:
- src/src/case
- src/src/http
- src/src/persistence
- src/src/errors
- src/src/factories
- src/migrations
modules:
- name: case-store-port
  path: src/src/case/case-store.port.ts
  role: touched
- name: relational-case-store-repository
  path: src/src/persistence/relational-case-store.repository.ts
  role: touched
- name: case-lifecycle-factory
  path: src/src/factories/case-lifecycle.factory.ts
  role: touched
- name: discard-operation
  path: src/src/case/discard.operation.ts
  role: adjacent
- name: status-map
  path: src/src/errors/status-map.ts
  role: touched
- name: remove-connector-routes
  path: src/src/http/remove-connector.routes.ts
  role: adjacent
- name: build-app
  path: src/src/http/build-app.ts
  role: touched
conventions:
- statement: One case-lifecycle operation is one route file, one controller, one zod
    dto, one domain-level operation module, and one repository method, wired in build-app.factory.ts
    and registered in build-app.ts's routePluginFactories array.
  seen_at: src/src/case/discard.operation.ts
- statement: A whole-aggregate removal answers with reply.code(204).send() from a
    thin controller with no business logic of its own.
  seen_at: src/src/http/remove-connector.routes.ts
- statement: A refusal is a plain Error subclass carrying a context object with the
    identifying fields and a Portuguese message built from it, registered once in
    STATUS_BY_ERROR_CLASS.
  seen_at: src/src/errors/status-map.ts
- statement: An existence check on the cases row reuses requireCaseIdentity rather
    than a second ad hoc query.
  seen_at: src/src/persistence/relational-case-store.repository.ts
must_not_duplicate:
- what: The cases-row existence check
  at: src/src/persistence/relational-case-store.repository.ts (requireCaseIdentity,
    lines 428-433)
- what: The generic DB-failure-to-refusal mapper used inside a transaction
  at: src/src/persistence/relational-case-store.repository.ts (raiseWriteFailure)
risks:
- risk: hypotheses and hypothesis_revisions rows can outlive every case_versions row
    for a slug (discard only ever deletes case_versions and case_version_hypotheses),
    so a delete that removes only the cases row can leave those rows referencing a
    cases.slug that no longer exists.
  consumers:
  - src/src/persistence/relational-case-store.repository.ts
  - src/migrations/0004-case-and-hypothesis.sql (hypotheses.case_slug REFERENCES cases(slug),
    no ON DELETE CASCADE)
---

## What it is

The case-version lifecycle (create-draft, release, discard, revise-hypothesis, update-draft) is implemented as one route file, one controller, one dto, one domain-level operation module, and one repository method per operation, wired together in `src/src/factories/build-app.factory.ts` and registered in `src/src/http/build-app.ts`'s `routePluginFactories` array.
`src/src/case/discard.operation.ts` is the sibling operation named in the scope: it reads the targeted case-version's state via `store.assembleVersion`, throws `CaseNotFoundError` when absent and `CaseVersionNotDraftError` when not a draft, then calls `store.discard(slug, version)` — it never touches the parent `cases` row.
`RelationalCaseStore.discard` (`src/src/persistence/relational-case-store.repository.ts:210-212`) delegates to `discardDraft(tx, key)` (lines 875-879), which re-checks draft state inside the same transaction (`requireVersionState` + `refuseUnlessDraft`), deletes `case_version_hypotheses` rows for that version, then deletes the `case_versions` row — all inside one `runInTransaction` call using `raiseWriteFailure` as the generic DB-failure mapper.
The HTTP shape for a no-content removal is `discard.routes.ts` (`DELETE /v1/cases/:slug/versions/:version`) to `discard.controller.ts`'s `handleDiscardRequest` (a thin pass-through) to `reply.code(204).send()` on success; parameter validation is a zod schema in `discard.dto.ts` returning 400 on failure. `remove-connector.routes.ts`/`.controller.ts` follow the identical thin-controller, 204-response shape for a whole-aggregate delete (not a sub-resource), with `ConnectorConfigurationRegistryService.removeConnector` delegating straight to `store.deleteConnectorConfiguration(connector)`.
`ICaseStore` (`src/src/case/case-store.port.ts:115-146`) is the port every case-lifecycle operation and the one repository implementation (`RelationalCaseStore`) conform to; it currently declares no `delete`/`deleteCase` method, and `CaseLifecycleOperations` (`src/src/factories/case-lifecycle.factory.ts:21-29`) currently exposes no `delete` entry either.
The schema (`src/migrations/0004-case-and-hypothesis.sql`, `0009-case-version-lifecycle-schema.sql`) shows `cases` referenced by two child tables: `case_versions.slug REFERENCES cases (slug)` and `hypotheses.case_slug REFERENCES cases (slug)` (no `ON DELETE CASCADE` on either); `hypotheses` is itself referenced by `hypothesis_revisions`, which is referenced by `case_version_hypotheses` and `hypothesis_revision_collects`.

## Notes

No file named `case.operation.ts`, `delete-case.operation.ts`, or similar exists yet — this is new source, not an edit to an existing operation.
The scope's `CaseHoldsVersionsError` naming the slug follows the exact same shape as `CaseAlreadyHasDraftError`/`CaseHoldsNoDraftError` (a single `{ slug }` context, a Portuguese message built from it, `name` set explicitly) and would need one new entry added to `STATUS_BY_ERROR_CLASS` at 409, beside the other case-lifecycle 409s.
Because `hypotheses`/`hypothesis_revisions` rows can outlive every `case_versions` row for a slug (the discarded-draft scenario the scope's own health-review trigger describes), a delete operation that removes only the `cases` row would leave orphaned `hypotheses`/`hypothesis_revisions`/`hypothesis_revision_collects` rows behind unless it also removes those — this is a transactional-scope question the scope file itself does not resolve and the repository's existing `discardDraft` never had to answer, since it only ever runs while at least one other version might still exist.
None of the existing lifecycle operations (`create-draft`, `release`, `discard`, `revise-hypothesis`) delete the `cases` row itself; `delete` would be the first operation to do so, so there is no existing sibling for "removing the identity row," only for "removing a version under it."
