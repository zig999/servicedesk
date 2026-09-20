---
contract_version: siegard-reconcile/5
title: Case-not-valid surface presentation review, second pass
summary: Reviews the fix for the first review's three conformance findings against domain/knowledge/case-summary,
  delivered as a re-delivery of task/case-not-valid-surface-presentation/isolate-invalid-case-from-listing
  under initiative case-not-valid-surface-presentation-corrective.
target: frontend
files:
- path: src/hooks/use-cases-list-invalid-case-isolation.spec.ts
  change: Fixtures for released cases now include title/when_to_use in mocked version-detail responses
    and title/whenToUse/releasedVersion in expected summaries; adds a test for the current-version-is-a-draft/released-version-below-it
    derivation path.
- path: src/hooks/use-cases-list.spec.ts
  change: 'Pre-existing test file, first entering this review''s file set: its released-case fixture and
    expectation were widened to include title, whenToUse and releasedVersion, matching CaseSummary''s
    now-wider shape.'
- path: src/hooks/use-cases-list.ts
  change: Adds releasedInfo() to derive title, whenToUse and releasedVersion from the case's own highest-numbered
    released version, reusing the already-fetched version detail when the current highest version is itself
    released, otherwise fetching the full version list once to find the highest released version below
    a current draft and that version's own detail.
- path: src/routes/cases-list-screen-invalid-case-isolation.spec.ts
  change: Unchanged by this re-delivery; carried over from the first delivery.
- path: src/routes/cases-list-screen.tsx
  change: Unchanged by this re-delivery; carried over from the first delivery (isCaseListEntryNotValid
    branch presenting the not-valid statement, every other row unaffected).
nodes:
- node: contracts/knowledge/case-query
  conforms: true
  how: 'src/routes/cases-list-screen.tsx: held at the `useCasesList()` call, line 77 — const casesQuery
    = useCasesList();'
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: domain/knowledge/case
  conforms: true
  how: "src/hooks/use-cases-list.ts: held at the `CaseIdentity` type and its use in `fetchCasesWithSummaries`,\
    \ which reads only the slug off each case identity before delegating to `fetchCaseListEntry` — type\
    \ CaseIdentity = {\n  readonly slug: string;\n};\n...\nreturn Promise.all(casesPage.data.map((identity)\
    \ => fetchCaseListEntry(identity.slug)));\nsrc/routes/cases-list-screen.tsx: held at the row identity\
    \ and route built from each entry's slug, lines 50-51 and 91 — id: entry.slug,\nslug: entry.slug,\n\
    ...\nvoid navigate({ to: \"/cases/$slug\", params: { slug } });"
  encoded_at:
  - src/hooks/use-cases-list.ts
  - src/routes/cases-list-screen.tsx
- node: domain/knowledge/case-summary
  conforms: true
  how: "src/hooks/use-cases-list.ts: held at the `CaseSummary` type declaration and its construction in\
    \ `fetchCaseListEntry` / `releasedInfo`: `current_state`/`last_updated` are populated only once at\
    \ least one version exists, and `title`/`when_to_use`/`released_version` only once a released version\
    \ is found, matching the node's presence conditions field for field — export type CaseSummary = {\n\
    \  readonly versionCount: number;\n  readonly currentState?: CaseVersionState;\n  readonly lastUpdated?:\
    \ string;\n  readonly title?: string;\n  readonly whenToUse?: string;\n  readonly releasedVersion?:\
    \ number;\n};\n...\nreturn {\n  slug,\n  summary: {\n    versionCount,\n    currentState: highest.state,\n\
    \    lastUpdated: detail.authored_at,\n    ...released,\n  },\n};\nsrc/routes/cases-list-screen.tsx:\
    \ held at toRow()'s non-null branch, lines 45-55 -- current_state, version_count and last_updated\
    \ are read; title, when_to_use and released_version are never read anywhere in this file — const stateCell\
    \ =\n  entry.summary.currentState === undefined\n    ? { color: \"bg-muted\", label: NO_VERSION_YET_LABEL\
    \ }\n    : CASE_STATE_CELL[entry.summary.currentState];\nreturn {\n  id: entry.slug,\n  slug: entry.slug,\n\
    \  state: stateCell,\n  versionCount: entry.summary.versionCount,\n  lastUpdated: formatLastUpdated(entry.summary.lastUpdated),\n\
    };"
  encoded_at:
  - src/hooks/use-cases-list.ts
  - src/routes/cases-list-screen.tsx
  decided_by: reading
  remainder: testable
  remainder_why: 'Two assertions close it, each one input against one expected result. First: a case whose
    versions listing comes back empty (data [], total 0) resolves to an entry whose summary carries version_count
    0 and carries neither current_state nor last_updated -- asserted as absence of the keys, via the same
    whole-object toEqual the file already uses, so an invented value fails. Second: a case whose every
    version is a draft (for instance a current v2 draft over a v1 draft, the full-listing fetch returning
    no released version) resolves to a summary carrying current_state "draft", version_count 2 and last_updated
    from v2, and carrying neither title nor when_to_use nor released_version, with the draft''s own title
    and when_to_use present in the fixture and distinct, so a fallback that read them from the draft fails.'
- node: domain/knowledge/case-version-state
  conforms: false
  how: 'src/hooks/use-cases-list.ts, line 17, the module-level type declaration `export type CaseVersionState
    = "draft" | "released";`: export type CaseVersionState = "draft" | "released"; — The case-version
    lifecycle''s two states are the specification''s own enumeration (`domain/knowledge/case-version-state`),
    and this file re-declares them as a literal union under its own authority rather than importing the
    one that already exists in the codebase (`frontend/app/src/hooks/use-case-versions.ts` exports the
    identical `export type CaseVersionState = "draft" | "released";`, consumed by `case-simulation-header.tsx`
    and `use-case-simulation-version.ts`). A third place now carries the same vocabulary; if the specification''s
    enumeration is ever extended, there is no single site a maintainer is led back to, and the two independent
    declarations can silently diverge from each other and from the node.'
  observed_at:
  - src/routes/cases-list-screen.tsx
- node: rules/knowledge/a-case-listing-offers-a-route-to-author-a-new-case-on-every-reading
  conforms: true
  how: "src/routes/cases-list-screen.tsx: held at the top-level return's Button, lines 146-148, outside\
    \ renderBody() so it renders on every branch renderBody() returns — <Button type=\"button\" onClick={()\
    \ => void navigate({ to: \"/cases/new\" })}>\n  Create case\n</Button>"
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone
  conforms: true
  how: "src/hooks/use-cases-list.ts: held at the `CaseListEntry` union together with the catch branch\
    \ in `fetchCaseListEntry`: when the highest version's detail fetch reports `case-not-valid`, the function\
    \ returns only the slug and the `notValid` flag, carrying none of the summary fields — } catch (error)\
    \ {\n  if (errorStateKind(error) === \"case-not-valid\") {\n    return { slug, notValid: true };\n\
    \  }\n  throw error;\n}\nsrc/routes/cases-list-screen.tsx: held at the isCaseListEntryNotValid branch\
    \ of toRow(), lines 38-44 — if (isCaseListEntryNotValid(entry)) {\n  return {\n    id: entry.slug,\n\
    \    slug: entry.slug,\n    state: CURRENT_VERSION_NOT_VALID_STATEMENT,\n  };\n}"
  encoded_at:
  - src/hooks/use-cases-list.ts
  - src/routes/cases-list-screen.tsx
  decided_by: reading
  remainder: testable
  remainder_why: Three finite assertions close it. (1) Render the cases-list screen -- not the hook --
    over the first test's stubbed fetch set, and assert that the entry for case-broken shows the does-not-read-back
    statement and none of current_state, version_count, last_updated, title, when_to_use or released_version,
    while the entry for case-alpha shows its own summary. (2) Add a case holding three versions where
    version 3 is valid and version 2 returns CaseVersionNotValidError, and assert the entry carries that
    case's summary with no notValid key. (3) Add a case whose versions listing is empty, and assert its
    entry carries versionCount 0 with currentState and lastUpdated absent and no not-valid statement.
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  conforms: true
  how: "src/routes/cases-list-screen.tsx: held at the same stateCell/versionCount/lastUpdated derivation,\
    \ lines 45-55, distinguishing a case with no version (currentState undefined) from one with a current_state\
    \ — entry.summary.currentState === undefined\n  ? { color: \"bg-muted\", label: NO_VERSION_YET_LABEL\
    \ }\n  : CASE_STATE_CELL[entry.summary.currentState];"
  encoded_at:
  - src/routes/cases-list-screen.tsx
unbound:
- src/hooks/use-cases-list-invalid-case-isolation.spec.ts
- src/hooks/use-cases-list.spec.ts
- src/routes/cases-list-screen-invalid-case-isolation.spec.ts
notes: 'Judged by 5 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/case-not-valid-surface-presentation-corrective-2.returns/.

  Certification of rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone
  did not hold: the auditor answered `partial` — The two tests above bind the fact at the hook''s returned
  data, and they bind it exactly: each asserts the whole array with toEqual, so an entry dropped for the
  failing case, a listing that failed whole, a sibling entry altered by the other case''s failure, or
  any of current_state, version_count, last_updated, title, when_to_use or released_version surviving
  into the failing case''s entry would make them fail. Three things the node states are still unexercised.
  First, nothing in the offered proof renders the listing a curator reads: all three tests call renderHook(useCasesList),
  so the entry carrying "the explicit statement that this case''s current version does not read back as
  a case at that reading" is proved only as the datum notValid: true. The node leaves the control, the
  wording and the position to the interface, but not whether the entry carries the statement at all --
  a screen that dropped notValid entries, rendered them as a blank row, or rendered a summary beside them
  would leave every named test green. The pack offers no screen test, so no test of mine to cite closes
  this. Second, the failing version number does vary across the tests (5, 2, 9), but never against a valid
  sibling inside the same case: every not-valid case is read only at its highest version, so nothing asserts
  that it is v_i -- the highest-numbered version -- whose validation decides the entry. A case holding
  versions 1..3 where version 2 fails and version 3 holds must, by the expression''s second branch, still
  carry its summary and state none of this; no test submits that pairing, and an implementation keyed
  on any version failing would pass the set as it stands. The middle describe (case-drafted-past-release)
  reads a lower version for title and when_to_use but fails no validator, so it does not reach this. Third,
  the node distinguishes this entry from the absence a case holding no version shows; no test submits
  a case with zero versions, so nothing would fail if such a case were given the not-valid statement instead
  of version_count zero with current_state and last_updated absent.. The node is decided by reading, and
  a certification standing on it from an earlier reconciliation is released by the bind. The remainder
  is testable: Three finite assertions close it. (1) Render the cases-list screen -- not the hook -- over
  the first test''s stubbed fetch set, and assert that the entry for case-broken shows the does-not-read-back
  statement and none of current_state, version_count, last_updated, title, when_to_use or released_version,
  while the entry for case-alpha shows its own summary. (2) Add a case holding three versions where version
  3 is valid and version 2 returns CaseVersionNotValidError, and assert the entry carries that case''s
  summary with no notValid key. (3) Add a case whose versions listing is empty, and assert its entry carries
  versionCount 0 with currentState and lastUpdated absent and no not-valid statement..

  Certification of domain/knowledge/case-summary did not hold: the auditor answered `partial` — The presence
  half of the fact is exercised and would fail if it stopped holding: the second test pins title, when_to_use
  and released_version to the case''s own highest released version (v2) while the current version is a
  higher-numbered draft (v3) whose title and when_to_use are deliberately distinct, and it pins current_state,
  version_count and last_updated to that most recently authored draft; the first and third tests pin the
  same derivation where the current version is itself released. Both absence halves are unexercised. No
  fixture gives a case that currently holds no version at all, so "current_state and last_updated are
  present only where the case currently holds at least one version ... absent rather than invented" is
  never put to the test -- an implementation that invented either for a case whose every version was discarded
  would pass all three tests. No fixture gives a case that currently holds only drafts and no released
  version, so "title, when_to_use and released_version are present only where the case currently holds
  at least one released version ... absent rather than read from a draft" is never put to the test either
  -- the only draft-headed case in the set (case-drafted-past-release) has released versions below it,
  so an implementation that fell back to the draft''s own title and when_to_use when no released version
  existed would pass unchanged. version_count is asserted in all three, but only for cases holding at
  least one version, so its required-ness at zero is likewise unexercised. The isolated not-valid entries
  assert absence of a summary, not absence of an attribute within one, and so bear on the isolation fact
  rather than on this node''s optionality.. The node is decided by reading, and a certification standing
  on it from an earlier reconciliation is released by the bind. The remainder is testable: Two assertions
  close it, each one input against one expected result. First: a case whose versions listing comes back
  empty (data [], total 0) resolves to an entry whose summary carries version_count 0 and carries neither
  current_state nor last_updated -- asserted as absence of the keys, via the same whole-object toEqual
  the file already uses, so an invented value fails. Second: a case whose every version is a draft (for
  instance a current v2 draft over a v1 draft, the full-listing fetch returning no released version) resolves
  to a summary carrying current_state "draft", version_count 2 and last_updated from v2, and carrying
  neither title nor when_to_use nor released_version, with the draft''s own title and when_to_use present
  in the fixture and distinct, so a fallback that read them from the draft fails..

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone,
  domain/knowledge/case-summary, domain/knowledge/case were read on every file and answered for, and bound
  from nowhere here — a binding this record writes is one the trace already held.

  Candidates: 4 opened across 3 of 5 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/case-not-valid-surface-presentation-corrective-2.returns/`, which are the evidence behind every entry above.
