---
target: frontend
title: 'Review: case-creation-screen-corrective'
summary: Reviews the delivery of task/case-creation-screen-corrective/wire-case-creation-to-a-real-screen-and-route -- the /cases/new screen, route and always-offered header control.
reviewed:
- src/routes/cases-list-screen.tsx
- src/routes/route-tree.tsx
- src/routes/case-creation-screen.tsx
- src/routes/case-creation-form-fields.tsx
- src/hooks/use-case-creation-form.ts
- src/services/case-creation-form-schema.ts
- src/routes/case-creation-screen.test-support.ts
- src/routes/case-creation-screen-submission.spec.ts
- src/routes/case-creation-screen-required-content.spec.ts
- src/routes/cases-list-screen-create-case-control.spec.ts
- src/routes/cases-list-screen.spec.ts
- src/routes/cases-list-screen-aria-live.spec.ts
- src/routes/route-tree.spec.ts
tasks:
- task/case-creation-screen-corrective/wire-case-creation-to-a-real-screen-and-route
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: a failing run to diagnose -- the capture run (run/case-creation-screen-corrective) passed every step clean
coverage:
- criterion: The cases list screen no longer renders a permanently disabled "Create case" control; the control is enabled and navigates to a case-creation screen.
  state: covered
  tests:
  - file: src/routes/cases-list-screen-create-case-control.spec.ts
    name: offers an always-enabled Create case control that navigates to /cases/new, whichever reading the case listing is currently in -- outstanding, failed, answering no case, or answering at least one
  - file: src/routes/route-tree.spec.ts
    name: renders the /cases/new route through CaseCreationScreen (task/case-creation-screen-corrective/wire-case-creation-to-a-real-screen-and-route, criterion 2), distinct from the /cases/$slug route's own component
- criterion: A /cases/new route exists in the frontend route tree and renders the case-creation screen.
  state: covered
  tests:
  - file: src/routes/route-tree.spec.ts
    name: renders the /cases/new route through CaseCreationScreen (task/case-creation-screen-corrective/wire-case-creation-to-a-real-screen-and-route, criterion 2), distinct from the /cases/$slug route's own component
  - file: src/routes/route-tree.spec.ts
    name: registers a route at each of the nineteen proposal-plus-origination screens' paths, and no other
- criterion: Submitting the case-creation screen with the information the case domain requires creates a new case and takes the user to that case, without the user needing an existing slug beforehand.
  state: covered
  tests:
  - file: src/routes/case-creation-screen-submission.spec.ts
    name: creates the case via POST /v1/cases carrying the curator's own typed slug verbatim, and lands on /cases/{slug}/versions/{version} using the version the response names, without ever reading that slug beforehand
- criterion: The case-creation screen never offers its submitting act while the information the case domain requires is absent from its fields; it states, in the act's place, which required information is still absent, named against the field that would carry it, and no case is created.
  state: partial
  tests:
  - file: src/routes/case-creation-screen-required-content.spec.ts
    name: withholds the submit action while any single piece of create-draft's required content is absent, naming exactly the field left blank, refuses to create a case while it is clicked disabled, and enables the act once all seven are filled -- never gated by the optional consolidation register left untouched (underdetermined entry 3)
  why: 'Every iteration leaves exactly one of the seven required fields absent; the screen''s own opening state (all seven absent) and a case with two-or-more absent at once are never mounted, so "states ... which required information is still absent" as a plural claim is unexercised -- a surface naming only the first absent field would pass every assertion here. The "named against the field that would carry it" half is asserted as a substring of the whole statement''s text rather than tied to the specific field, so a statement naming content by an unrelated label (confirmed against the file: the "Subject" case is satisfied by the unrelated substring of the "Subject type" label) would also pass.'
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
reconciliation: siegard-reconcile/case-creation-screen-corrective.md
findings:
- pass: standard
  file: src/routes/cases-list-screen.tsx
  cites: ARC-03
  where: fetchCaseSummary / fetchCasesWithSummaries / toRow, lines 45-120
  evidence: "async function fetchCasesWithSummaries(): Promise<CaseListEntry[]> {\n    const casesPage = await apiFetch<PaginatedResponse<CaseIdentity>>(\"/v1/cases\");\n    const summaries = await Promise.all(\n      casesPage.data.map((identity) => fetchCaseSummary(identity.slug)),\n    );\n    ..."
  cost: The probing of each case's own version count, current state and last-updated timestamp, and its transformation into the row shape the table renders, is written as unexported module-scope functions inside the route file itself rather than in a hook or service module -- unlike the sibling case-creation screen, whose equivalent logic sits in use-case-creation-form.ts. None of the three specs that exercise this screen reach fetchCasesWithSummaries, fetchCaseSummary or toRow except by mounting the whole screen and stubbing global fetch.
  correction: Move fetchCasesWithSummaries, fetchCaseSummary and toRow into a dedicated hook (e.g. use-cases-list.ts) or a service module that CasesListScreen calls, mirroring how useCaseCreationForm hosts the case-creation screen's own logic.
- pass: standard
  file: src/routes/cases-list-screen.tsx
  cites: PRF-02
  where: filteredEntries, lines 147-150
  evidence: "const filteredEntries = useMemo(\n      () => filterEntriesBySlug(entries, searchText),\n      [entries, searchText],\n    );"
  cost: filterEntriesBySlug is a single .filter/.includes pass over the fetched cases list, cheaper than the dependency comparison useMemo performs on every render, and nothing in the file measures or names a cost that would justify memoizing it.
  correction: Compute filteredEntries directly as filterEntriesBySlug(entries, searchText) and reserve useMemo for a derivation with a measured cost.
- pass: standard
  file: src/routes/cases-list-screen.tsx
  cites: ARC-01
  where: the search input, lines 192-199
  evidence: "<input\n          type=\"search\"\n          value={searchText}\n          onChange={handleSearchChange}\n          placeholder=\"Search cases by slug\"\n          aria-label=\"Search cases by slug\"\n          className=\"w-full max-w-sm rounded border border-border bg-surface px-3 py-2 text-sm text-foreground\"\n        />"
  cost: This hand-styled raw <input> reimplements the border, background, padding and text treatment that @tui/ui/input's Input component already ships -- the same Input component this very change already imports and uses for every text field in case-creation-form-fields.tsx.
  correction: Render this control as <Input type="search" ... /> from @tui/ui/input instead of a raw <input>.
- pass: conformance
  file: src/routes/case-creation-screen-submission.spec.ts
  where: lines 51-55, the assertion following the POST call
  evidence: "expect(\n        calledAnyUrlStartingWith(fetchMock, `/v1/cases/${typedSlug}`),\n        \"expected no prior read of the typed slug before create-draft is submitted\",\n      ).toBe(false);"
  cost: 'This locks in a rule no specification node ever decided: that the case-authoring surface must never issue a read against the typed slug before submitting create-draft. rules/knowledge/a-case-authoring-surface-offers-no-submission-while-required-content-is-absent is explicit that it bounds the absent case only and decides nothing about what happens once every required field holds content. A future change adding a legitimate slug-availability check would fail this test though no node prohibits one.'
  correction: Either state, in a specification node, that a case-authoring surface must not read the case being created before submitting create-draft, or drop the assertion if the specification means to leave this open.
- pass: conformance
  file: src/hooks/use-case-creation-form.ts
  where: 'mutationFn''s request-body construction, authored_at: new Date().toISOString()'
  evidence: "const body: CreateDraftRequestBody = {\n    slug: values.slug,\n    authored_at: new Date().toISOString(),"
  cost: No node says whose clock or which moment authored_at records. This hook fixes that meaning unilaterally -- the browser's local clock at the instant the mutation fires, rather than a server-assigned receipt time -- so a skewed client clock can misstate the audit trail the decision log says authored_at exists for, without breaking anything the specification checks.
  correction: domain/knowledge/case-version's authored_at attribute (or contracts/knowledge/case-lifecycle's create-draft operation) would need to state whether authored_at is client-submitted or server-assigned, and at which moment of the act it is taken.
- pass: conformance
  file: src/routes/cases-list-screen-aria-live.spec.ts
  where: lines 94-95, the initial announcement assertion
  evidence: 'const initialAnnouncement = screen.getByText("3 cases found");

    expect(initialAnnouncement.getAttribute("aria-live")).toBe("polite");'
  cost: No node says the case listing announces its row count through a live region, at what politeness level, or in what wording. A later reader has nothing in the specification to check this against.
  correction: Add a node (or extend the case-listing presentation rule) stating that the case listing announces its row count via a live region, naming the aria-live level and the wording/pluralization the announcement uses.
- pass: conformance
  file: src/routes/cases-list-screen-aria-live.spec.ts
  where: lines 97-103, the search interaction and updated announcement
  evidence: "fireEvent.change(screen.getByLabelText(\"Search cases by slug\"), {\n    target: { value: \"beta\" },\n  });\n\n  const updatedAnnouncement = screen.getByText(\"1 case found\");"
  cost: 'The test exercises a search-by-slug filter over the case listing -- a capability contracts/knowledge/case-query does not publish: list-cases is described as the plain read of every case, with no search or filter parameter, and no rule in this file''s node set mentions filtering by slug.'
  correction: Add a node stating that the case listing offers a search that filters by slug (and what match rule it applies), so the capability has a specification home rather than living only in this test.
- pass: conformance
  file: src/routes/cases-list-screen.spec.ts
  where: the three 'it' blocks at lines 164-209, 211-249 and 251-281 (search behavior)
  evidence: 'it("narrows the rendered rows to cases whose slug matches the typed search text", async () => {

    ...

    const filteredRows = within(table).getAllByRole("button");

    expect(filteredRows).toHaveLength(1);'
  cost: The rule that a curator may narrow the case listing by typed slug text -- including that the match is against slug alone and that a listing answering no match keeps the searchable table rather than the no-cases-yet empty state -- is asserted here as a requirement of the screen, but the specification never states that the case listing offers any search or filtering capability at all.
  correction: A node stating that the case listing may be narrowed by typed slug text, and what that narrowing does and does not match against, would have to be added to the specification (or the search behavior removed from the screen and its test) before this test states it as a requirement on its own authority.
- pass: conformance
  file: src/services/case-creation-form-schema.ts
  where: isBlank (lines 39-41), applied by stillAbsentRequiredFields to every required field
  evidence: "function isBlank(value: string | undefined): boolean {\n  return value === undefined || value.trim() === \"\";\n}"
  cost: The specification never says whether a whitespace-only value counts as "absent" for the purpose of withholding create-draft's submission; this file now answers that for every required field of a case, and the next reader who wants to know what "absent" means will find nothing in rules/knowledge/a-case-authoring-surface-offers-no-submission-while-required-content-is-absent.
  correction: State, in that rule or its decision log entry, whether whitespace-only content is treated as absent for the case's required fields -- the way the analogous connector-field decision already states it for a Connector field's name.
- pass: conformance
  file: src/routes/cases-list-screen.tsx
  where: fetchCaseSummary, lines 54-61
  evidence: "const highestOffset = versionCount - 1;\n  const highestPage =\n    highestOffset < probe.data.length\n      ? probe\n      : await apiFetch<PaginatedResponse<CaseVersionListItem>>(\n          caseVersionsUrl(slug, 1, highestOffset),\n        );\n  const highest = highestPage.data[0];"
  cost: current_state and last_updated are picked by treating the item at page offset versionCount - 1 as "the highest-numbered version" -- a rule the code applies that only holds if list-case-versions answers a case's versions in ascending version-number order, which no node commits it to. If the API's own arrangement ever differs, current_state and last_updated would silently come from the wrong version with nothing in the spec to say so.
  correction: A node stating the order list-case-versions answers in (or an explicit way to request "the highest-numbered version" instead of inferring it from an offset) would settle what this code currently assumes on its own.
---
## What it is

Review of the delivered case-creation-screen-corrective task -- the /cases/new screen, route,
and the cases list's always-offered "Create case" control -- run over the whole change: coverage
of its four criteria, whether the source states only what the specification holds, whether it
follows the project's own frontend standard, and a captured run of the full registry.

## Notes

The failures pass did not run: the capture run (run/case-creation-screen-corrective) passed every step clean, so there was no failure for a diagnostician to read.
The trace check over frontend/app before this review found 32 pre-existing `code`-class drift findings unrelated to this change, over files this task never touched (case-simulation, capability and manifest-builder files); those are `/reconcile`'s to answer, not this review's, and are listed in the report rather than here.
Two nodes this task implements are certified as decided by a test rather than by reading: rules/knowledge/a-case-listing-offers-a-route-to-author-a-new-case-on-every-reading (by cases-list-screen-create-case-control.spec.ts) and rules/knowledge/a-successful-case-version-creation-lands-on-the-created-versions-own-surface (by case-creation-screen-submission.spec.ts). A third, rules/knowledge/a-case-authoring-surface-offers-no-submission-while-required-content-is-absent, was certified `partial` (the same gap the coverage pass's fourth criterion entry names) and so remains decided by reading until a further certification closes it.
