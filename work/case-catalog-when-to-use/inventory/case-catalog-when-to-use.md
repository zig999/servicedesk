---
title: How list-cases is wired today, and what deriving a case-summary needs to reuse
summary: Traces the current list-cases path (route to store) and the case_versions schema and "latest
  released version" query the new title/when_to_use/released_version fields would extend.
sources:
- intake/scope.md
area:
- src/src/http/list-cases.routes.ts
- src/src/http/list-cases.controller.ts
- src/src/http/dto/list-cases.dto.ts
- src/src/case/case-store.port.ts
- src/src/case/case-query.port.ts
- src/src/case/case-query.service.ts
- src/src/case/case.ts
- src/src/persistence/relational-case-store.repository.ts
- src/src/types/pagination.ts
- src/src/factories/build-app.factory.ts
- src/migrations/0009-case-version-lifecycle-schema.sql
- src/src/__tests__/unit/http/list-cases.routes.spec.ts
- src/src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
modules:
- name: list-cases-http
  path: src/src/http/list-cases.routes.ts
  role: touched
- name: list-cases-controller
  path: src/src/http/list-cases.controller.ts
  role: touched
- name: list-cases-dto
  path: src/src/http/dto/list-cases.dto.ts
  role: touched
- name: case-store-port
  path: src/src/case/case-store.port.ts
  role: touched
- name: case-query-port
  path: src/src/case/case-query.port.ts
  role: touched
- name: case-query-service
  path: src/src/case/case-query.service.ts
  role: touched
- name: relational-case-store
  path: src/src/persistence/relational-case-store.repository.ts
  role: touched
- name: case-version-lifecycle-schema
  path: src/migrations/0009-case-version-lifecycle-schema.sql
  role: depends-on
- name: pagination-types
  path: src/src/types/pagination.ts
  role: depends-on
- name: build-app-factory
  path: src/src/factories/build-app.factory.ts
  role: adjacent
- name: case-domain-type
  path: src/src/case/case.ts
  role: adjacent
conventions:
- statement: The latest released version of a case is read with SELECT MAX(version) AS version FROM case_versions
    WHERE slug = $1 AND state = 'released' (resolveSourceVersion/latestReleasedVersionSelect).
  seen_at: src/src/persistence/relational-case-store.repository.ts:479-492
- statement: title, when_to_use, state and released_at are read off one specific (slug, version) row via
    caseVersionSelect/assembleWholeVersion, never off a listing.
  seen_at: src/src/persistence/relational-case-store.repository.ts:159-222
- statement: An optional field absent from a response is omitted via a spread conditional object literal,
    never emitted as null.
  seen_at: src/src/case/case-query.service.ts:97-101
must_not_duplicate:
- what: The "highest-numbered version in released state" query — resolveSourceVersion/latestReleasedVersionSelect
    already expresses exactly the rule's own wording.
  at: src/src/persistence/relational-case-store.repository.ts:479-492
risks:
- risk: CaseIdentity = { slug } is the shared response item type for list-cases across the port, the service,
    the controller and existing test doubles; widening it to carry the new case-summary fields changes
    a type every one of those consumes.
  consumers:
  - src/src/case/case-store.port.ts
  - src/src/case/case-query.port.ts
  - src/src/case/case-query.service.ts
  - src/src/http/list-cases.controller.ts
  - src/src/__tests__/unit/http/list-cases.routes.spec.ts
- risk: listCasesPage selects only slug from cases and never joins case_versions; deriving the new fields
    per row in a paginated listing is a new join/aggregate this query does not do today.
  consumers:
  - src/src/persistence/relational-case-store.repository.ts
  - src/src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
---

## What it is

The end-to-end path GET /v1/cases follows today: list-cases.routes.ts parses offset/limit via listCasesQuerySchema (zod, both optional) and calls handleListCasesRequest in list-cases.controller.ts.
The controller resolves pagination bounds and calls dependencies.caseQuery.listCases(pagination), typed to return PaginatedResponse<CaseIdentity>.
ICaseQuery.listCases (case-query.port.ts) and ICaseStore.listCases (case-store.port.ts) both carry that same signature; CaseQueryService.listCases (case-query.service.ts:48-50) is a one-line passthrough to this.caseStore.listCases(pagination), adding no shaping of its own.
CaseIdentity is { slug: string } only (case-store.port.ts:71-73); no other case-summary field (title, when_to_use, released_version, current_state, version_count, last_updated) exists anywhere in source today — case-summary is a specification-only value object with no code counterpart yet.
RelationalCaseStore.listCases runs listCasesPage, which counts rows in cases and selects SELECT slug FROM cases ORDER BY slug LIMIT $1 OFFSET $2 (relational-case-store.repository.ts:231-257); the cases table (migrations/0009) holds only slug and next_version — no title, when_to_use or state, which live entirely on case_versions.
case_versions (migrations/0009-case-version-lifecycle-schema.sql:27-41, altered at :95-113) carries title, when_to_use, authored_at, state (draft|released, CHECK-constrained), and released_at (nullable, set only on release) per row, keyed by (slug, version); a partial unique index enforces at most one draft row per slug.
assembleWholeVersion/caseVersionSelect (relational-case-store.repository.ts:159-222) is the one place title/when_to_use/state/released_at are read off a specific (slug, version) row, used by readCase via CaseQueryService.readCase → heldVersion → structuralCase; read-case always takes an explicit version argument, never "the latest" of anything.
The existing convention for "the latest released version" of a case is resolveSourceVersion/latestReleasedVersionSelect in relational-case-store.repository.ts:479-492, run only inside createDraft (to pick the default source_version for a new draft): SELECT MAX(version) AS version FROM case_versions WHERE slug = $1 AND state = 'released'.
No query today derives "current state (of the highest-numbered version regardless of state)" or "version_count" or "last_updated" — case_versions.state and case_versions.authored_at exist as columns but nothing aggregates MAX(version) unconditionally (only the released-filtered MAX in latestReleasedVersionSelect), and no COUNT(*)-per-slug or MAX(authored_at)-per-slug query exists in this store.
The optional-field JSON-shaping convention already in use is spreading a conditional object literal, e.g. ...(assembled.released_at !== undefined ? { released_at: ... } : {}) (case-query.service.ts:97-101, 159-163; relational-case-store.repository.ts:206-208) — used wherever a field is absent rather than null.
PaginatedResponse<T> (types/pagination.ts) is a fixed generic envelope (data, total, limit, offset, pageCount); list-cases returns PaginatedResponse<CaseIdentity> and any richer catalog item would still have to fit inside that same envelope's data array.
buildAppDependencies/listDependencies (factories/build-app.factory.ts:97-109) wires listCases: { caseQuery, defaultLimit, maxLimit } from the single shared caseQuery (a CaseQueryService over RelationalCaseStore) — no separate wiring exists for a summary-shaped read.

## Notes

resolveSourceVersion's latestReleasedVersionSelect is the query to reuse or generalize for released_version/title/when_to_use per case — it already expresses "highest-numbered version in released state" exactly as the rule states it; writing a second, differently-worded query for the same fact would duplicate it.
Introducing case-summary fields on the list-cases response changes CaseIdentity (or replaces it with a richer item type) in case-store.port.ts, which is shared by ICaseStore, ICaseQuery, the controller and every test double built against it (list-cases.routes.spec.ts's heldPage/ListCasesMock construct PaginatedResponse<CaseIdentity> literals with only slug) — those fixtures are consumers that would need new shape, not just new call sites.
listCasesPage's current SQL selects only slug from cases and never joins case_versions; deriving title/when_to_use/released_version (and current_state/version_count/last_updated) per case in a paginated listing is a per-row aggregate/join this query does not do today, so extending it (or adding a decorating step) is new work, not a rename of existing work.
No code currently computes current_state, version_count, or last_updated anywhere — the survey found no existing helper for either the unconditional-highest-version read or the count/last-updated aggregation; both are net-new, so nothing exists yet to accidentally duplicate for those two, but they are named in the domain model (case-summary.md) alongside the three fields this scope asks for, so a task touching this listing should watch for tasks elsewhere also computing them off the same rows.
case_versions_no_update/case_versions_no_delete_when_released are Postgres RULEs (migrations/0009:122-142) that no-op writes to released rows; they do not affect read/derive queries but explain why "released" rows are safe to read without a snapshot-consistency concern once assembled.
