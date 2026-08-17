---
title: ICaseStore gains listCaseVersions
summary: Adds a paginated listCaseVersions read to ICaseStore and its relational adapter, refusing a slug
  naming no case at all through CaseNotFoundError.
task: sha256:6f9db0f641fe200b0953be2d9f9bb04939a1ce5bd5ee877b6b10e04f0d2354de
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/store-extensions-batch-suite
files:
- path: src/case/case-store.port.ts
  effect: declares CaseVersionListItem (version and state alone) and adds ICaseStore.listCaseVersions(slug,
    pagination).
- path: src/persistence/relational-case-store.repository.ts
  effect: 'implements listCaseVersions: within one transaction, refuses an unknown slug via CaseNotFoundError
    by checking the cases table''s own identity row first, then answers a paginated page of case_versions''
    version/state pairs.'
criteria:
- criterion: Calling listCaseVersions with an existing slug returns every version that case currently
    holds, paginated per src/types/pagination.ts.
  met: true
  how: listCaseVersionsPage reads case_versions for the slug, ordered by version, and answers the full
    PaginatedResponse<T> envelope.
- criterion: Calling listCaseVersions with a slug that does not exist is refused with CaseNotFoundError.
  met: true
  how: requireCaseIdentity queries the cases table for the slug, inside the same transaction, before any
    version row is ever read; finding no row, it throws CaseNotFoundError before the count or page is
    queried.
nodes:
- node: contracts/knowledge/case-query
  how: listCaseVersions is the storage primitive the list-case-versions operation is built on.
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case
  how: requireCaseIdentity checks the cases table's own identity row directly, so a case whose next_version
    counter survives the discard of every version it ever held is answered with an empty page rather than
    refused.
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version
  how: CaseVersionListItem carries exactly this node's own version and state attributes, the two facts
    a listing states about each version.
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
inferences:
- inferred: A listing item (CaseVersionListItem) carries only the version number and its own declared
    state, none of case-version's heavier attributes.
  from: domain/knowledge/case-version's own declared attributes, read alongside the task's own guidance
    that a listing item is lighter than assembleVersion's whole-version read.
- inferred: An unknown slug is told apart from a known case currently holding no version by checking the
    cases table's own identity row directly.
  from: domain/knowledge/case's own description of next_version surviving the discard of any one version
    — a case's identity persists independently of which versions it currently holds.
- inferred: CaseNotFoundError is constructed with a sentinel version, NO_VERSION_NAMED = 0, when this
    refusal implicates no particular version at all.
  from: CaseNotFoundError's own existing signature (slug, version), both required, and cases.next_version's
    own DEFAULT 1, which guarantees no real case version is ever assigned the number 0.
preserved:
- Every existing ICaseStore method's own behavior is unchanged; listCaseVersions is added as a new interface
  member and a new class method touching no existing statement, constant or helper.
- listCasesPage's own convention and the file's existing pageCountOf, caseVersionStateOf, CASES_TABLE
  and CASE_VERSIONS_TABLE helpers/constants are reused rather than duplicated.
---

## What it is

A new read-only ICaseStore method, listCaseVersions, refusing an unknown slug the same way assembleVersion already does.

## Notes

None.
