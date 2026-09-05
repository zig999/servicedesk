---
title: 'Case lifecycle: hypothesis-revision aggregate, its store port, HTTP surface and persistence'
summary: The layered src/src/case, src/src/http, src/src/persistence and src/migrations slice where hypothesis-revision
  currently borrows its release state from any case-version that manifests it, and where the scope's own-state
  lifecycle, its release-hypothesis endpoint and the manifest-only-released-revisions gate must land.
area:
- src/src/case
- src/src/http
- src/src/persistence
- src/src/factories
- src/src/errors
- src/migrations
- src/src/__tests__/unit/case
- src/src/__tests__/unit/http
- src/src/__tests__/integration/case
- src/src/__tests__/integration/persistence
modules:
- name: case-domain-type
  path: src/src/case/case.ts
  role: touched
- name: case-store-port
  path: src/src/case/case-store.port.ts
  role: touched
- name: hypothesis-revision-release-state-port
  path: src/src/case/hypothesis-revision-release-state.port.ts
  role: touched
- name: hypothesis-revision-overwrite-port
  path: src/src/case/hypothesis-revision-overwrite.port.ts
  role: depends-on
- name: revise-hypothesis-operation
  path: src/src/case/revise-hypothesis.operation.ts
  role: touched
- name: release-operation
  path: src/src/case/release.operation.ts
  role: touched
- name: manifest-composition-operations
  path: src/src/case/manifest-composition.operations.ts
  role: depends-on
- name: validate-case-coherence
  path: src/src/case/validate-case-coherence.ts
  role: adjacent
- name: case-query-port-and-service
  path: src/src/case/case-query.port.ts
  role: touched
- name: case-query-service
  path: src/src/case/case-query.service.ts
  role: touched
- name: case-lifecycle-factory
  path: src/src/factories/case-lifecycle.factory.ts
  role: touched
- name: case-store-factory
  path: src/src/factories/case-store.factory.ts
  role: depends-on
- name: relational-case-store-repository
  path: src/src/persistence/relational-case-store.repository.ts
  role: touched
- name: release-http-surface
  path: src/src/http/release.controller.ts
  role: depends-on
- name: release-routes
  path: src/src/http/release.routes.ts
  role: adjacent
- name: revise-hypothesis-http-surface
  path: src/src/http/revise-hypothesis.controller.ts
  role: adjacent
- name: list-hypothesis-revisions-http-surface
  path: src/src/http/list-hypothesis-revisions.controller.ts
  role: touched
- name: list-hypothesis-revisions-dto
  path: src/src/http/dto/list-hypothesis-revisions.dto.ts
  role: adjacent
- name: build-app
  path: src/src/http/build-app.ts
  role: touched
- name: release-dto
  path: src/src/http/dto/release.dto.ts
  role: adjacent
- name: status-map
  path: src/src/errors/status-map.ts
  role: touched
- name: case-version-not-draft-at-release-error
  path: src/src/errors/case-version-not-draft-at-release.error.ts
  role: adjacent
- name: released-hypothesis-revision-not-alterable-error
  path: src/src/errors/released-hypothesis-revision-not-alterable.error.ts
  role: depends-on
- name: case-version-not-releasable-error
  path: src/src/errors/case-version-not-releasable.error.ts
  role: touched
- name: migrations
  path: src/migrations
  role: touched
- name: case-lifecycle-contract
  path: knowledge/contracts/knowledge/case-lifecycle.md
  role: adjacent
conventions:
- statement: Each domain error is its own class in src/src/errors/<kebab-name>.error.ts, extending Error,
    carrying a readonly context object and a message built from that context — never a generic error with
    a code field.
  seen_at: src/src/errors/case-version-not-draft-at-release.error.ts
- statement: Every domain error class is registered exactly once in STATUS_BY_ERROR_CLASS inside status-map.ts,
    which is the sole place an HTTP status is chosen for a domain error.
  seen_at: src/src/errors/status-map.ts
- statement: A state-machine rule that refuses a second transition follows the shape refuseNon<State>
    in the operation, throwing a *NotDraftAtReleaseError that carries slug/version/state (or the hypothesis-revision
    equivalent) as context.
  seen_at: src/src/case/release.operation.ts
- statement: 'An HTTP resource is three files: <name>.dto.ts (zod schemas), <name>.controller.ts (pure
    async handler function taking a dependencies bag), <name>.routes.ts (Fastify plugin factory that parses
    with the zod schema and calls the controller) — wired together as one more line in build-app.ts''s
    BuildAppDependencies type and routePluginFactories array.'
  seen_at: src/src/http/release.routes.ts
- statement: A store operation crossing more than the write path exposes a narrow, single-method port
    (e.g. IHighestRevisionReleaseStateQuery, IHypothesisRevisionOverwrite) that an operation class depends
    on via an intersection type, rather than depending on the whole ICaseStore.
  seen_at: src/src/case/hypothesis-revision-release-state.port.ts
- statement: RelationalCaseStore implements ICaseStore plus every narrow port the case operations need,
    and every method delegates to a runInTransaction call wrapping a free function that builds and runs
    the SQL statement.
  seen_at: src/src/persistence/relational-case-store.repository.ts
- statement: A migration file is a plain numbered .sql file under src/migrations/, applied once in filename
    order, and its header comment names every specification node it implements by path.
  seen_at: src/migrations/0009-case-version-lifecycle-schema.sql
- statement: A release-conditioned immutability rule on a Postgres table is expressed declaratively as
    CREATE RULE ... WHERE <condition> DO INSTEAD NOTHING (an unconditional block uses a plain trigger
    instead, as hypothesis_revisions_no_update does before this scope removes it).
  seen_at: src/migrations/0009-case-version-lifecycle-schema.sql
- statement: 'A *NotReleasableError-shaped refusal aggregates every violated rule into one violations:
    readonly string[] array rather than throwing on the first violation, so a release is refused whole,
    naming everything wrong at once.'
  seen_at: src/src/case/release.operation.ts
- statement: A unit spec proves a port file imports no database driver, HTTP framework or LLM client,
    by scanning its own import specifiers — the pattern any new hypothesis-revision-state-carrying port
    should keep passing.
  seen_at: src/src/__tests__/unit/case/hypothesis-revision-release-state.port.spec.ts
must_not_duplicate:
- what: IHighestRevisionReleaseStateQuery/readHighestRevisionReleaseState — the port ReviseHypothesisOperation
    already reads to decide overwrite-vs-insert; this is the seam a hypothesis-revision's own state column
    changes underneath, not a query to duplicate.
  at: src/src/case/hypothesis-revision-release-state.port.ts
- what: caseCoherenceViolations/releaseViolations accumulation shape in ReleaseOperation, which the new
    manifest-only-released-revisions gate must extend rather than reimplement.
  at: src/src/case/release.operation.ts
- what: The DTO/controller/routes/build-app wiring quartet already used for release and revise-hypothesis,
    to be repeated verbatim in shape for the new release-hypothesis endpoint.
  at: src/src/http/release.controller.ts
- what: STATUS_BY_ERROR_CLASS in status-map.ts — the one and only place a new HypothesisRevisionNotDraftAtReleaseError
    gets its HTTP 409 (and where CaseVersionNotReleasableError already sits at 422 for the manifest-gate
    reuse the scope asks for).
  at: src/src/errors/status-map.ts
- what: overwriteHypothesisRevision/insertHypothesisRevision on ICaseStore, which ReviseHypothesisOperation.writeRevision
    already calls and which must keep writing state = 'draft' rather than gaining a second write path.
  at: src/src/case/revise-hypothesis.operation.ts
risks:
- risk: hypothesis_revisions_no_update (via migration 0019's trigger) currently refuses every UPDATE once
    any released case-version references the row; decoupling release from the manifest means this trigger's
    own condition must move onto the revision's own new state column, or a hypothesis-revision released
    with no case-version ever referencing it stays silently editable.
  consumers:
  - src/src/case/revise-hypothesis.operation.ts
  - src/src/persistence/relational-case-store.repository.ts
  - src/src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
- risk: readHighestRevisionReleaseState's released_referenced field is computed today as an EXISTS join
    against case_version_hypotheses/case_versions; every caller reading this shape (the revise-hypothesis
    overwrite gate) needs to move to the revision's own state without silently changing ReviseHypothesisOperation's
    branching outcome for revisions that are released but never manifested by anything.
  consumers:
  - src/src/case/revise-hypothesis.operation.ts
  - src/src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
- risk: HypothesisRevisionListItem (case-store.port.ts) and the row mapping in hypothesisRevisionListItemOf
    currently carry no state field; every reader of listHypothesisRevisions — the controller, the DTO
    response shape and any integration spec asserting the shape returned — must gain it together or the
    listing silently omits the disclosure the scope asks for.
  consumers:
  - src/src/http/list-hypothesis-revisions.controller.ts
  - src/src/case/case-query.service.ts
  - src/src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
- risk: ReleaseOperation.release()'s assembledAsDocument/parseCaseDocument path re-derives a Case from
    AssembledCaseVersion before running coherence checks; adding the released-hypothesis-revision gate
    here without touching that reconstruction risks either checking against stale/reconstructed data or
    duplicating a second read of assembled.manifest that disagrees with the one validate-case-coherence.ts
    already walks.
  consumers:
  - src/src/case/release.operation.ts
  - src/src/__tests__/integration/case/release.operation.spec.ts
- risk: Migration 0009's hypothesis_revisions_no_update unconditional rule and 0019's replacement trigger
    are both referenced by name in later integration schema specs; replacing them with a state-column-conditioned
    rule changes the exact SQL error/exception text (ReleasedHypothesisRevisionNotAlterableError raised
    via RAISE EXCEPTION) those specs assert on.
  consumers:
  - src/src/__tests__/integration/persistence/revision-alteration-refused-only-when-released-schema.spec.ts
  - src/src/__tests__/integration/persistence/protect-released-hypothesis-revision-collects-schema.spec.ts
sources:
- work/hipotese-release-proprio/intake/scope.md
---

## What it is

The `case` aggregate slice of `src/` (domain type, ports, operations), its HTTP surface under `src/src/http`, its persistence in `src/src/persistence/relational-case-store.repository.ts`, and the schema in `src/migrations` — everything the scope's release-hypothesis lifecycle, the manifest-release gate and the listing disclosure touch.
`hypothesis-revision`'s release state is currently derived, not stored: `readHighestRevisionReleaseState` computes `released_referenced` by joining to any case-version in released state that references the revision, and the schema's own immutability trigger fires on that same join — both are exactly what the scope decouples into the revision's own state.
`ReleaseOperation.release()` (case-version) reconstructs a `Case` from the assembled version and runs `caseCoherenceViolations`, aggregating every violation into one `CaseVersionNotReleasableError`; the scope's manifest-only-released-revisions gate is one more violation source to fold into that same list.
The HTTP layer is a fixed three-file-per-endpoint convention (dto/controller/routes) wired into `build-app.ts`, already exercised by `release` and `revise-hypothesis`, which the new `release-hypothesis` endpoint follows.
Every domain error is one class registered once in `status-map.ts`'s `STATUS_BY_ERROR_CLASS`; the scope's `HypothesisRevisionNotDraftAtReleaseError` (409) is a new entry there, while the manifest gate's violation reuses the existing `CaseVersionNotReleasableError` (422) unchanged.

## Notes

None.
