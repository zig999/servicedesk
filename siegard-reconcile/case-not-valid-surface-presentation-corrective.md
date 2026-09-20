---
contract_version: siegard-reconcile/5
title: Case-not-valid surface presentation review
summary: Reviews the delivery of task/case-not-valid-surface-presentation/isolate-invalid-case-from-listing
  under initiative case-not-valid-surface-presentation-corrective, which isolates one case's invalid current
  version from the rest of the /cases listing.
target: frontend
files:
- path: src/hooks/use-cases-list-invalid-case-isolation.spec.ts
  change: written by the delivery of task/case-not-valid-surface-presentation/isolate-invalid-case-from-listing
- path: src/hooks/use-cases-list.ts
  change: 'CaseListEntry is now a two-member union -- { slug, summary } for a case whose current version
    reads back, and { slug, notValid: true } for one whose highest-numbered version does not. fetchCaseListEntry
    (renamed from fetchCaseSummary) wraps only the read of the case''s highest-numbered version in a try/catch
    that reuses errorStateKind(error) to recognize a CaseVersionNotValidError and return the not-valid
    entry instead of the summary; any other error still propagates. fetchCasesWithSummaries runs fetchCaseListEntry
    per case inside Promise.all, so one case''s rejection no longer aborts the others. Exports isCaseListEntryNotValid,
    a type guard narrowing to the not-valid member.'
- path: src/routes/cases-list-screen-invalid-case-isolation.spec.ts
  change: written by the delivery of task/case-not-valid-surface-presentation/isolate-invalid-case-from-listing
- path: src/routes/cases-list-screen.tsx
  change: toRow checks isCaseListEntryNotValid first and, for that entry, returns a row carrying only
    id and slug plus a state cell holding the explicit statement "This case's current version does not
    read back as a case." -- the same wording case-detail-screen.tsx already carries for its own not-valid
    phase. versionCount and lastUpdated are left unset on that row so they render empty rather than a
    summary value or the zero-version placeholder. Every other row's construction is unchanged.
nodes:
- node: contracts/knowledge/case-query
  conforms: true
  how: 'src/routes/cases-list-screen.tsx: held at the `useCasesList()` call feeding the whole screen''s
    data, line 77 — const casesQuery = useCasesList();'
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: domain/knowledge/case
  conforms: true
  how: "src/hooks/use-cases-list.ts: held at the `CaseIdentity` type and its use as the key for every\
    \ fetched entry — type CaseIdentity = {\n  readonly slug: string;\n};\n...\ncasesPage.data.map((identity)\
    \ => fetchCaseListEntry(identity.slug))\nsrc/routes/cases-list-screen.tsx: held at the `slug` field\
    \ carried on every row and used as both the row key and the search key, lines 40-41, 50-51 and 70\
    \ — slug: entry.slug,"
  encoded_at:
  - src/hooks/use-cases-list.ts
  - src/routes/cases-list-screen.tsx
- node: domain/knowledge/case-summary
  conforms: false
  how: "src/hooks/use-cases-list-invalid-case-isolation.spec.ts, the case-alpha version-detail mock and\
    \ its expected summary in the first test, lines 61-62 and 78-82: \"/v1/cases/case-alpha/versions/1\"\
    : () =>\n  jsonResponse({ authored_at: \"2024-01-01T00:00:00.000Z\" }),\n...\n{\n  slug: \"case-alpha\"\
    ,\n  summary: { versionCount: 1, currentState: \"released\", lastUpdated: \"2024-01-01T00:00:00.000Z\"\
    \ },\n}, — case-alpha's current version is stated as released (`state: \"released\"` in the versions\
    \ list), so a reader treating this test as the contract for a released case's summary is told title,\
    \ when_to_use and released_version are never part of it; an implementation change that stops deriving\
    \ those three fields for a released case would pass this test undetected.\nsrc/hooks/use-cases-list-invalid-case-isolation.spec.ts,\
    \ the case-good version-detail mock and its expected summary in the second test, lines 107-108 and\
    \ 133-137: \"/v1/cases/case-good/versions/1\": () =>\n  jsonResponse({ authored_at: \"2024-02-02T00:00:00.000Z\"\
    \ }),\n...\n{\n  slug: \"case-good\",\n  summary: { versionCount: 1, currentState: \"released\", lastUpdated:\
    \ \"2024-02-02T00:00:00.000Z\" },\n}, — same gap as case-alpha, repeated in the second test: case-good's\
    \ current version is released yet the expected summary carries no title, when_to_use or released_version,\
    \ so the test again pins a shape the specification does not allow for a released case.\nsrc/hooks/use-cases-list.ts,\
    \ the `CaseSummary` type (lines 28-32) and the object `fetchCaseListEntry` returns for a valid entry\
    \ (lines 70-77): export type CaseSummary = {\n  readonly versionCount: number;\n  readonly currentState?:\
    \ CaseVersionState;\n  readonly lastUpdated?: string;\n};\n...\nreturn {\n  slug,\n  summary: {\n\
    \    versionCount,\n    currentState: highest.state,\n    lastUpdated: detail.authored_at,\n  },\n\
    }; — A consumer of `useCasesList` can never receive a case's title, when_to_use or released_version\
    \ for a released case: the type has no field for any of the three and fetchCaseListEntry only ever\
    \ fetches the case's highest-numbered version (via `/versions/${highest.version}`), never its highest\
    \ released one. The specification's own case-summary was extended precisely so a catalog reader —\
    \ a curator browsing, or \"an automated consumer comparing every when_to_use before choosing\" — could\
    \ read these off the listing without opening each case's versions; here that data is structurally\
    \ unreachable from the hook the listing screen consumes."
  observed_at:
  - src/hooks/use-cases-list.ts
  - src/routes/cases-list-screen.tsx
- node: domain/knowledge/case-version-state
  conforms: true
  how: "src/routes/cases-list-screen.tsx: held at the CASE_STATE_CELL map, lines 17-20, keyed exhaustively\
    \ over the two enumeration values — const CASE_STATE_CELL: Readonly<Record<CaseVersionState, { color:\
    \ string; label: string }>> = {\n  draft: { color: \"bg-warning\", label: \"Draft\" },\n  released:\
    \ { color: \"bg-success\", label: \"Released\" },\n};"
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: rules/knowledge/a-case-listing-offers-a-route-to-author-a-new-case-on-every-reading
  conforms: true
  how: "src/routes/cases-list-screen.tsx: held at the \"Create case\" Button in the component's outer\
    \ return, lines 142-149, placed beside `{renderBody()}` rather than inside it — <Button type=\"button\"\
    \ onClick={() => void navigate({ to: \"/cases/new\" })}>\n        Create case\n      </Button>"
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone
  conforms: true
  how: "src/hooks/use-cases-list.ts: held at the try/catch around the highest version's detail fetch in\
    \ `fetchCaseListEntry`, and the `notValid` branch of the `CaseListEntry` union — export type CaseListEntry\
    \ =\n  | { readonly slug: string; readonly summary: CaseSummary }\n  | { readonly slug: string; readonly\
    \ notValid: true };\n...\ntry {\n  detail = await apiFetch<CaseVersionDetail>(\n    `/v1/cases/${encodeURIComponent(slug)}/versions/${highest.version}`,\n\
    \  );\n} catch (error) {\n  if (errorStateKind(error) === \"case-not-valid\") {\n    return { slug,\
    \ notValid: true };\n  }\n  throw error;\n}\nsrc/routes/cases-list-screen.tsx: held at the `isCaseListEntryNotValid`\
    \ branch of `toRow`, lines 38-44 — if (isCaseListEntryNotValid(entry)) {\n    return {\n      id:\
    \ entry.slug,\n      slug: entry.slug,\n      state: CURRENT_VERSION_NOT_VALID_STATEMENT,\n    };\n\
    \  }"
  encoded_at:
  - src/hooks/use-cases-list.ts
  - src/routes/cases-list-screen.tsx
  decided_by: reading
  remainder: testable
  remainder_why: 'Two assertions would close it. For the statement: render the cases listing against the
    same stubbed reading, with one case''s current version failing a validator rule, and assert the rendered
    entry for that case carries a statement that its current version does not read back as a case at that
    reading, while carrying no current_state, version_count, last_updated, title, when_to_use or released_version,
    and that the sibling entry renders its own summary. For the version selection: stub a case holding
    several versions whose versions-list response carries more than one entry — say versions 3, 5 and
    9 — with the read of version 9 failing a validator rule and the reads of 3 and 5 succeeding, and assert
    the entry is the not-valid entry; then the converse, with 9 succeeding and a lower-numbered version
    failing, asserting the entry carries the case''s summary and states none of this.'
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  conforms: true
  how: "src/routes/cases-list-screen.tsx: held at the same `toRow` normal branch, lines 45-54, where an\
    \ absent currentState/lastUpdated is shown as an explicit absence rather than an invented value —\
    \ entry.summary.currentState === undefined\n    ? { color: \"bg-muted\", label: NO_VERSION_YET_LABEL\
    \ }\n    : CASE_STATE_CELL[entry.summary.currentState];"
  encoded_at:
  - src/routes/cases-list-screen.tsx
unbound:
- src/hooks/use-cases-list-invalid-case-isolation.spec.ts
- src/routes/cases-list-screen-invalid-case-isolation.spec.ts
notes: 'Judged by 4 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/case-not-valid-surface-presentation-corrective.returns/.

  Certification of rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone
  did not hold: the auditor answered `partial` — Much of the fact is exercised strictly. Both tests assert
  the hook''s whole result with `toEqual` over the entry array, so an entry for the failing case is proven
  present rather than dropped; the failing entry is proven to carry its own slug and nothing else, which
  holds "it states no fact of c_i''s summary" negatively — notably version_count, which the hook has in
  hand (the versions-list call for case-broken succeeds and reports total 5) and must still withhold;
  and the unaffected entries are proven to carry their own summary values and to state none of this, since
  any leaked `notValid` key would break the same deep equality. Two ways the fact can stop holding are
  unexercised. First, the fact is that the failing entry "carries, in place of the whole summary it would
  otherwise have carried, the explicit statement that this case''s current version does not read back
  as a case at that reading"; the node places which control carries that statement and how it is worded
  with the interface, but that a statement is carried at all is the fact, not form. The offered proof
  reaches only the data hook, which returns `notValid: true`. A listing surface that consumed that flag
  and rendered the entry as a bare slug with nothing said would leave the curator told nothing about the
  case that needs correction, and both named tests would still pass. Second, the expression conditions
  the statement on v_i, "the version, among the versions c_i currently holds, whose version number is
  highest". Every mocked versions-list response returns exactly one version regardless of the case''s
  total (case-broken reports total 5 and returns only version 5), so the hook''s selection of which version
  to read back is fixed by the fixture rather than asserted. A hook that validated some version other
  than the highest-numbered one would state "this case''s current version does not read back" of a case
  whose current version does read back — the fact stops holding — and neither test would fail.. The node
  is decided by reading, and a certification standing on it from an earlier reconciliation is released
  by the bind. The remainder is testable: Two assertions would close it. For the statement: render the
  cases listing against the same stubbed reading, with one case''s current version failing a validator
  rule, and assert the rendered entry for that case carries a statement that its current version does
  not read back as a case at that reading, while carrying no current_state, version_count, last_updated,
  title, when_to_use or released_version, and that the sibling entry renders its own summary. For the
  version selection: stub a case holding several versions whose versions-list response carries more than
  one entry — say versions 3, 5 and 9 — with the read of version 9 failing a validator rule and the reads
  of 3 and 5 succeeding, and assert the entry is the not-valid entry; then the converse, with 9 succeeding
  and a lower-numbered version failing, asserting the entry carries the case''s summary and states none
  of this..

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone,
  domain/knowledge/case-summary, domain/knowledge/case were read on every file and answered for, and bound
  from nowhere here — a binding this record writes is one the trace already held.

  Candidates: 4 opened across 3 of 4 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/case-not-valid-surface-presentation-corrective.returns/`, which are the evidence behind every entry above.
