---
title: Case-lifecycle revise-hypothesis module (backend)
summary: The backend module that implements revise-hypothesis today — operation, HTTP
  layer, and the relational store's always-insert write path and its unconditional
  no-update schema rule.
sources:
- work/hypothesis-revision-editable-until-published/intake/scope.md
area:
- src/src/case
- src/src/http
- src/src/persistence
- src/migrations
- src/src/__tests__/integration/case
- src/src/__tests__/unit
modules:
- name: revise-hypothesis-operation
  path: src/src/case/revise-hypothesis.operation.ts
  role: touched
- name: case-store-port
  path: src/src/case/case-store.port.ts
  role: touched
- name: revise-hypothesis-http
  path: src/src/http/revise-hypothesis.controller.ts
  role: touched
- name: revise-hypothesis-dto
  path: src/src/http/dto/revise-hypothesis.dto.ts
  role: adjacent
- name: relational-case-store
  path: src/src/persistence/relational-case-store.repository.ts
  role: touched
- name: case-version-lifecycle-schema
  path: src/migrations/0009-case-version-lifecycle-schema.sql
  role: depends-on
- name: protect-released-collects-migration
  path: src/migrations/0010-protect-released-hypothesis-revision-collects.sql
  role: depends-on
- name: place-hypothesis-manifest-repin
  path: src/src/case/case-store.port.ts
  role: adjacent
---

## What it is
`ReviseHypothesisOperation.reviseHypothesis` (src/src/case/revise-hypothesis.operation.ts) checks the case has a draft, validates `collects` against the glossary and subject-type acceptance, then unconditionally calls `caseStore.insertHypothesisRevision(input)` and returns `{ hypothesis_name, revision }`.
`RelationalCaseStore.insertHypothesisRevision` (relational-case-store.repository.ts, function `insertRevision` at line 531) inserts the hypothesis identity row (idempotent, `ON CONFLICT DO NOTHING`), then always inserts a new `hypothesis_revisions` row numbered `COALESCE(MAX(revision), 0) + 1` (function `revisionInsertStatement`, line 558), then inserts fresh `hypothesis_revision_collects` rows for the new revision — there is no code path today that updates an existing revision's row.
Migration `0009-case-version-lifecycle-schema.sql` creates `hypothesis_revisions_no_update` as an **unconditional** `DO INSTEAD NOTHING` rule on any UPDATE to `hypothesis_revisions` (line 188-190), justified there as answering `a-released-hypothesis-revision-is-never-altered` "a fortiori" — refusing every UPDATE, not only a released one.
Migration `0010-...sql` mirrors that same unconditional shape for `hypothesis_revision_collects_no_update` (line 80-82), and gives `hypothesis_revision_collects` its own release-conditioned DELETE rule (an `EXISTS` reach through `case_version_hypotheses` joined to `case_versions.state = 'released'`, line 84-96) — the exact join shape a revised, condition-aware UPDATE rule for both tables would need to reuse.
`findDraftVersion(slug)` (relational-case-store.repository.ts line 103, `draftVersionSelect` line 224) is the store's only existing "does this case have a draft" lookup, reused by `refuseWithoutDraft`.
`ICaseStore.listHypothesisRevisions` / `listHypothesisRevisionsPage` (line 365) is the only existing "all revisions of a hypothesis" read path, ordered by `revision` ascending in its SQL (`hypothesisRevisionsPageSelect`, not shown in full but paginated) — no code path today computes "the highest revision" or "is this revision referenced by a released version" as a value; both would be new queries.
The HTTP layer (`revise-hypothesis.routes.ts`, `.controller.ts`, `.dto.ts`) passes the body straight through to the operation and returns whatever `RevisedHypothesis` holds; nothing in the DTO or controller encodes "created" vs "overwrote".
`case_version_hypotheses_no_update_when_released` / `_no_delete_when_released` (migration 0009, lines 243-261) are the existing template for a release-conditioned rule reached through the same `case_versions.state = 'released'` join that a conditional `hypothesis_revisions` rule would need.

## Notes
The unconditional `hypothesis_revisions_no_update` rule (migration 0009) is a floor blocker for this change as stated: even once the operation is changed to sometimes issue an UPDATE to overwrite a revision in place, the database will silently no-op that UPDATE today, because the rule does not condition on release state the way `case_versions_no_update` and `case_version_hypotheses_no_update_when_released` already do. A schema migration replacing this rule with a release-conditioned one (the same `EXISTS` join already written twice in migrations 0009 and 0010) is squarely inside this scope's own rules (`a-released-hypothesis-revision-is-never-altered`), not an incidental side effect.
`insertHypothesisRevision` on `ICaseStore` is named for what it always does today; the port and the relational implementation both need a decision path (highest existing revision for this hypothesis, and whether any released case version's manifest references it) before choosing overwrite vs. insert — no such "is this revision released" query exists yet anywhere in the store.
The response shape `{ hypothesis_name, revision }` is unchanged by the scope's own text unless the analysis decides the curator needs to know whether the save created or overwrote (open question #2 in the source document) — `hypothesis-revision-screen.tsx`, `use-hypothesis-revision-form.ts` and `hypothesis-revision-screen-submit.spec.ts` in `frontend/app/src` are the consumers of that response today, but the frontend is out of this scope's target root.
`revise-hypothesis.operation.spec.ts` (src/src/__tests__/integration/case) already exercises "numbers a new revision one past the highest existing revision, and leaves the earlier revision's row unaltered" (line 183) as always-insert; this test's own assertions invert under the new rule (same-numbered revision, content overwritten) whenever the prior highest revision is unreleased, and must be rewritten rather than left alongside a new test that contradicts it.
`hypothesis_revision_collects` rows for an overwritten revision must also be replaced (deleted-then-reinserted, or diffed) since `insertRevisionRow`/`revisionCollectStatement` today only ever inserts fresh collect rows for a brand-new revision number; the migration's own release-conditioned DELETE rule on this table already tolerates a delete against an unreleased revision's collects, so a delete-and-reinsert on overwrite is not blocked at the schema level, only unwritten in code.
No code path in `src/` computes "highest revision" or "released-referencing" as a queryable fact today (confirmed by grep for `is_latest`, `isLatest`, `pinned_revision`, `highest_revision` across `src/`); the specification's own `a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest` rule is unimplemented in this codebase and is a separate, adjacent concern the survey found no existing helper for — building the overwrite-vs-insert decision for `revise-hypothesis` and building that presentation flag are two different queries even though both need a hypothesis's own highest revision.
