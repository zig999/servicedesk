---
contract_version: siegard-reconcile/5
title: Case-creation screen and route, wired from the cases list
summary: task/case-creation-screen-corrective/wire-case-creation-to-a-real-screen-and-route (initiative
  case-creation-screen-corrective) added a /cases/new route and screen backed by create-draft, and turned
  the cases list's own permanently-disabled "Create case" control into a real, always-offered entrance
  to it.
target: frontend
files:
- path: src/hooks/use-case-creation-form.ts
  change: New hook building the case-creation form, computing which required fields are still absent,
    and calling create-draft on submit; on success navigates to the created version's own surface, keyed
    on the slug and version the response itself names.
- path: src/routes/case-creation-form-fields.tsx
  change: New form-fields component rendering Slug, Title, When to use, Subject, Consolidation register
    and Fallback fields; renders a still-needed statement and disables the submit control while any required
    content is absent, without consolidation_register ever entering that gate.
- path: src/routes/case-creation-screen-required-content.spec.ts
  change: written by the delivery of task/case-creation-screen-corrective/wire-case-creation-to-a-real-screen-and-route
- path: src/routes/case-creation-screen-submission.spec.ts
  change: written by the delivery of task/case-creation-screen-corrective/wire-case-creation-to-a-real-screen-and-route
- path: src/routes/case-creation-screen.test-support.ts
  change: written by the delivery of task/case-creation-screen-corrective/wire-case-creation-to-a-real-screen-and-route
- path: src/routes/case-creation-screen.tsx
  change: New route component for /cases/new. Composes useCaseCreationForm's loading/load-error/ready
    states and CaseCreationFormFields.
- path: src/routes/cases-list-screen-aria-live.spec.ts
  change: Repaired button-count assertions to account for the header's always-rendered Create case button.
- path: src/routes/cases-list-screen-create-case-control.spec.ts
  change: written by the delivery of task/case-creation-screen-corrective/wire-case-creation-to-a-real-screen-and-route
- path: src/routes/cases-list-screen.spec.ts
  change: Repaired to match the corrected, always-enabled header control in place of the placeholder disabled
    button.
- path: src/routes/cases-list-screen.tsx
  change: The "Create case" control moved out of the empty-state block into the screen's own header, rendered
    unconditionally so it is present on every reading of the listing rather than only when zero cases
    exist; it is no longer disabled and now calls navigate to /cases/new.
- path: src/routes/route-tree.spec.ts
  change: Repaired to assert the new /cases/new route renders CaseCreationScreen.
- path: src/routes/route-tree.tsx
  change: Registers a new static /cases/new route rendering CaseCreationScreen, declared alongside the
    existing /cases and /cases/$slug routes.
- path: src/services/case-creation-form-schema.ts
  change: New schema module. caseCreationFormSchema extends the existing case-version-form-schema with
    a required slug; stillAbsentRequiredFields names, against each field, whether it is currently absent.
nodes:
- node: contracts/investigation/case-simulation
  conforms: true
  how: "src/routes/route-tree.tsx: held at the caseSimulationRoute definition, addressing the simulation\
    \ screen by the case's slug and the version it simulates — const caseSimulationRoute = createRoute({\n\
    \  getParentRoute: () => rootRoute,\n  path: \"/cases/$slug/versions/$version/simulate\",\n  component:\
    \ CaseSimulationScreen,\n});\n"
  encoded_at:
  - src/routes/route-tree.tsx
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: "src/hooks/use-case-creation-form.ts: held at the mutationFn's POST to /v1/cases, invoking create-draft\
    \ — return apiFetch<CreatedDraft>(\"/v1/cases\", {\n  method: \"POST\",\n  headers: { \"Content-Type\"\
    : \"application/json\" },\n  body: JSON.stringify(body),\n});"
  encoded_at:
  - src/hooks/use-case-creation-form.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: 'src/routes/cases-list-screen.tsx: held at fetchCasesWithSummaries and fetchCaseSummary, which
    call list-cases, list-case-versions and read-case — const casesPage = await apiFetch<PaginatedResponse<CaseIdentity>>("/v1/cases");

    ...

    caseVersionsUrl(slug, 1, 0)

    ...

    `/v1/cases/${encodeURIComponent(slug)}/versions/${highest.version}`'
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: domain/integration/capability
  conforms: true
  how: "src/routes/route-tree.tsx: held at the capabilityDetailRoute definition, keyed on the capability's\
    \ own name and version — const capabilityDetailRoute = createRoute({\n  getParentRoute: () => rootRoute,\n\
    \  path: \"/capabilities/$name/$version\",\n  component: CapabilityDetailScreen,\n});\n"
  encoded_at:
  - src/routes/route-tree.tsx
- node: domain/knowledge/case
  conforms: true
  how: "src/hooks/use-case-creation-form.ts: held at the `slug` field carried on the create-draft request\
    \ body — slug: values.slug,\nsrc/routes/cases-list-screen.tsx: held at the CaseIdentity type, carrying\
    \ the case's identity through the listing — type CaseIdentity = {\n  readonly slug: string;\n};\n\
    src/services/case-creation-form-schema.ts: held at the schema extension declaring `slug` and its entry\
    \ in REQUIRED_CASE_CREATION_FIELDS — slug: z.string().min(1),\n...\n{ path: \"slug\", label: \"Slug\"\
    \ },"
  encoded_at:
  - src/hooks/use-case-creation-form.ts
  - src/routes/cases-list-screen.tsx
  - src/services/case-creation-form-schema.ts
- node: domain/knowledge/case-summary
  conforms: true
  how: "src/routes/cases-list-screen.tsx: held at the CaseSummary type and its construction in fetchCaseSummary\
    \ — type CaseSummary = {\n  readonly versionCount: number;\n  readonly currentState?: CaseVersionState;\n\
    \  readonly lastUpdated?: string;\n};"
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: domain/knowledge/case-version
  conforms: true
  how: "src/routes/case-creation-form-fields.tsx: held at the Title, When to use, Subject type, Consolidation\
    \ register and Fallback outcome/referral(action)/referral(recipient) fields, each bound via register()/Controller\
    \ to the version's own declared attributes — <FormField label=\"Title\" errorId=\"title-error\" error={errors.title?.message}>\n\
    \  <Input\n    {...register(\"title\")}\nsrc/services/case-creation-form-schema.ts: held at the REQUIRED_CASE_CREATION_FIELDS\
    \ entries for title, when_to_use, subject and the fallback sub-fields (outcome, referral.action, referral.recipient)\
    \ — { path: \"title\", label: \"Title\" },\n{ path: \"when_to_use\", label: \"When to use\" },\n{\
    \ path: \"subject\", label: \"Subject\" },\n{ path: \"fallback.outcome\", label: \"Fallback outcome\"\
    \ },\n{ path: \"fallback.referral.action\", label: \"Fallback referral action\" },\n{ path: \"fallback.referral.recipient\"\
    , label: \"Fallback referral recipient\" },"
  encoded_at:
  - src/routes/case-creation-form-fields.tsx
  - src/services/case-creation-form-schema.ts
- node: domain/knowledge/case-version-state
  conforms: true
  how: 'src/routes/cases-list-screen.tsx: held at the CaseVersionState type — type CaseVersionState =
    "draft" | "released";'
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: rules/knowledge/a-case-authoring-surface-offers-no-submission-while-required-content-is-absent
  conforms: true
  how: "src/routes/case-creation-form-fields.tsx: held at the canSubmit computation, the disabled submit\
    \ button, and the still-absent statement shown in the act's place — const canSubmit = stillAbsentFields.length\
    \ === 0;\nsrc/services/case-creation-form-schema.ts: held at stillAbsentRequiredFields, which filters\
    \ REQUIRED_CASE_CREATION_FIELDS by isBlank and returns exactly the still-absent required fields, naming\
    \ consolidation_register and the manifest nowhere in that list — export function stillAbsentRequiredFields(\n\
    \  values: CaseCreationRequiredValues,\n): readonly RequiredCaseCreationField[] {\n  return REQUIRED_CASE_CREATION_FIELDS.filter((field)\
    \ =>\n    isBlank(readRequiredFieldValue(values, field.path)),\n  );\n}"
  encoded_at:
  - src/routes/case-creation-form-fields.tsx
  - src/services/case-creation-form-schema.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'The required content is a declared, finite enumeration, so the remainder is a test over
    the absences the loop leaves out. One input: mount the surface untouched, with all seven pieces of
    required content absent, and then a case with two or more absent together. One expected result: the
    act is still not offered and no case is created, and the statement in the act''s place names every
    absent piece — each read through the field that would carry it (resolving the field by its own label
    and asserting the statement names that same field) rather than by a substring of the statement''s
    text.'
- node: rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug
  conforms: true
  how: "src/hooks/use-case-creation-form.ts: held at the request body takes slug straight from the curator-typed\
    \ form value; the hook computes no slug of its own — slug: values.slug,\nsrc/services/case-creation-form-schema.ts:\
    \ held at the schema's own slug field, present as free text the caller supplies rather than a value\
    \ this schema derives — export const caseCreationFormSchema = caseVersionFormSchema.extend({\n  slug:\
    \ z.string().min(1),\n});"
  encoded_at:
  - src/hooks/use-case-creation-form.ts
  - src/services/case-creation-form-schema.ts
- node: rules/knowledge/a-case-listing-offers-a-route-to-author-a-new-case-on-every-reading
  conforms: true
  how: "src/routes/cases-list-screen.tsx: held at the \"Create case\" Button rendered in CasesListScreen's\
    \ own outer JSX, outside and before the branches of renderBody(), so it is present whether the query\
    \ is pending, errored, or answered zero cases — <Button type=\"button\" onClick={() => void navigate({\
    \ to: \"/cases/new\" })}>\n  Create case\n</Button>\n{renderBody()}"
  encoded_at:
  - src/routes/cases-list-screen.tsx
  decided_by: test
  step: test
  proof:
  - src/routes/cases-list-screen-create-case-control.spec.ts
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  conforms: true
  how: "src/routes/cases-list-screen.tsx: held at fetchCaseSummary's zero-version branch and its assembly\
    \ of currentState/lastUpdated from what it takes to be the highest-numbered version — if (versionCount\
    \ === 0) {\n  return { versionCount };\n}\n...\nreturn {\n  versionCount,\n  currentState: highest.state,\n\
    \  lastUpdated: detail.authored_at,\n};"
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: rules/knowledge/a-successful-case-version-creation-lands-on-the-created-versions-own-surface
  conforms: true
  how: "src/hooks/use-case-creation-form.ts: held at the mutation's onSuccess handler — onSuccess: (data)\
    \ => {\n  void navigate({\n    to: \"/cases/$slug/versions/$version\",\n    params: { slug: data.slug,\
    \ version: String(data.version) },\n  });\n},"
  encoded_at:
  - src/hooks/use-case-creation-form.ts
  decided_by: test
  step: test
  proof:
  - src/routes/case-creation-screen-submission.spec.ts
unstated:
- file: src/hooks/use-case-creation-form.ts
  where: 'mutationFn''s request-body construction, `authored_at: new Date().toISOString()`'
  evidence: "const body: CreateDraftRequestBody = {\n  slug: values.slug,\n  authored_at: new Date().toISOString(),"
  cost: The decision log's own reason for requiring authored_at is "an audit of which procedure was current
    when an old investigation ran," yet no node says whose clock or which moment the field records. This
    hook fixes that meaning unilaterally — the browser's local clock at the instant the mutation fires,
    rather than a server-assigned receipt time — so a skewed client clock can misstate the audit trail
    without breaking anything the specification checks, and the next reader auditing authored_at's precision
    will look in domain/knowledge/case-version and find only "required, datetime," not this rule.
- file: src/routes/case-creation-screen-submission.spec.ts
  where: lines 51-55, the assertion following the POST call
  evidence: "expect(\n      calledAnyUrlStartingWith(fetchMock, `/v1/cases/${typedSlug}`),\n      \"expected\
    \ no prior read of the typed slug before create-draft is submitted\",\n    ).toBe(false);"
  cost: 'This locks in a rule no specification node ever decided: that the case-authoring surface must
    never issue a read against the typed slug before submitting create-draft. The specification''s own
    withholding rule (rules/knowledge/a-case-authoring-surface-offers-no-submission-while-required-content-is-absent)
    is explicit that it "bounds the absent case only" and decides nothing about what happens once every
    required field holds content — it says nothing about a slug-existence read. Nothing in domain/knowledge/case
    or rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug forbids such a read
    either; that rule only describes how the backend resolves a slug collision once create-draft is submitted,
    not what the surface may do beforehand. A future change adding a legitimate slug-availability check
    (which no node prohibits) would fail this test, and nobody consulting the specification would find
    the constraint the test is actually enforcing, because it was never decided there.'
- file: src/routes/cases-list-screen-aria-live.spec.ts
  where: lines 94-95, the initial announcement assertion
  evidence: 'const initialAnnouncement = screen.getByText("3 cases found");

    expect(initialAnnouncement.getAttribute("aria-live")).toBe("polite");'
  cost: The test pins an aria-live="polite" live region announcing the case count in the exact wording
    "N cases found"/"N case found" (see the singular form asserted at line 101). No node in the specification
    — including contracts/knowledge/case-query, which publishes list-cases as the plain listing read,
    and every case-listing rule in this file's own node set — says the listing announces its row count
    through a live region, at what politeness level, or in what wording. A later reviewer who wants to
    know what the case listing must announce, or who changes this wording, has nothing in the specification
    to check it against; the accessibility behavior lives only in this test.
- file: src/routes/cases-list-screen-aria-live.spec.ts
  where: lines 97-103, the search interaction and updated announcement
  evidence: "fireEvent.change(screen.getByLabelText(\"Search cases by slug\"), {\n  target: { value: \"\
    beta\" },\n});\n\nconst updatedAnnouncement = screen.getByText(\"1 case found\");"
  cost: 'The test exercises a search-by-slug filter over the case listing (typing "beta" narrows three
    rendered cases to one) — a capability contracts/knowledge/case-query does not publish: list-cases
    is described as the plain read of every case, with no search or filter parameter, and no rule in this
    file''s node set (including rules/knowledge/a-case-listing-offers-a-route-to-author-a-new-case-on-every-reading,
    the one presentation rule this file''s set carries for the listing) mentions filtering by slug. Whether
    the listing may be searched, and what it searches against, is a fact this test carries alone rather
    than one the specification states.'
- file: src/routes/cases-list-screen.spec.ts
  where: the three 'it' blocks at lines 164-209, 211-249 and 251-281 (search behavior)
  evidence: 'it("narrows the rendered rows to cases whose slug matches the typed search text", async ()
    => {

    ...

    it("does not narrow rows by a match against a visible column other than slug", async () => {

    ...

    it("keeps showing the searchable table with zero rows when the search text matches no case, rather
    than the no-cases-yet empty state", async () => {

    ...

    const input = screen.getByLabelText("Search cases by slug");

    fireEvent.change(input, { target: { value: "beta" } });

    const filteredRows = within(table).getAllByRole("button");

    expect(filteredRows).toHaveLength(1);'
  cost: The rule that a curator may narrow the case listing by typed slug text — including that the match
    is against slug alone (a typed match on the rendered "Released" state text is required to yield zero
    rows) and that a listing answering no match keeps the searchable table rather than falling back to
    the no-cases-yet empty state — is asserted here as a requirement of the screen, but the specification
    never states that the case listing offers any search or filtering capability at all. A reader who
    goes to the specification to learn what the case listing does will not find this feature, and the
    next person changing it has only this test file to consult, so the rule now lives in a place no one
    revising the business is looking.
- file: src/routes/cases-list-screen.tsx
  where: fetchCaseSummary, lines 54-61
  evidence: "const highestOffset = versionCount - 1;\nconst highestPage =\n  highestOffset < probe.data.length\n\
    \    ? probe\n    : await apiFetch<PaginatedResponse<CaseVersionListItem>>(\n        caseVersionsUrl(slug,\
    \ 1, highestOffset),\n      );\nconst highest = highestPage.data[0];"
  cost: current_state and last_updated are picked by treating the item at page offset versionCount - 1
    as "the highest-numbered version" — a rule the code applies that only holds if list-case-versions
    answers a case's versions in ascending version-number order. The specification decides that order
    for the cases listing itself (cases-in-slug-order) and for a hypothesis's revisions (highest-revision-first),
    but no node commits list-case-versions to any order at all, so a reader who wants to know why offset
    versionCount - 1 names the current version has nowhere in the specification to look; if the API's
    own arrangement ever differs, current_state and last_updated would silently come from the wrong version
    with nothing in the spec to say so.
- file: src/services/case-creation-form-schema.ts
  where: isBlank (lines 39-41), applied by stillAbsentRequiredFields to every entry of REQUIRED_CASE_CREATION_FIELDS
    — slug, title, when_to_use, subject, fallback.outcome, fallback.referral.action, fallback.referral.recipient
  evidence: "function isBlank(value: string | undefined): boolean {\n  return value === undefined || value.trim()\
    \ === \"\";\n}"
  cost: The specification never says whether a slug, title, when_to_use, subject or fallback value consisting
    only of whitespace counts as "absent" for the purpose of withholding create-draft's submission; this
    file now answers that for every required field of a case, so the next reader who wants to know what
    "absent" means for these fields will look at rules/knowledge/a-case-authoring-surface-offers-no-submission-while-required-content-is-absent
    and find nothing, because the decision lives only in this trim() call.
unbound:
- src/routes/case-creation-screen-required-content.spec.ts
- src/routes/case-creation-screen-submission.spec.ts
- src/routes/case-creation-screen.test-support.ts
- src/routes/case-creation-screen.tsx
- src/routes/cases-list-screen-aria-live.spec.ts
- src/routes/cases-list-screen-create-case-control.spec.ts
- src/routes/cases-list-screen.spec.ts
- src/routes/route-tree.spec.ts
notes: 'Judged by 13 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/case-creation-screen-corrective.returns/.

  Certified rules/knowledge/a-case-listing-offers-a-route-to-author-a-new-case-on-every-reading as decided
  by step `test`: src/routes/cases-list-screen-create-case-control.spec.ts would fail if the fact stopped
  holding.

  Certified rules/knowledge/a-successful-case-version-creation-lands-on-the-created-versions-own-surface
  as decided by step `test`: src/routes/case-creation-screen-submission.spec.ts (creates the case via
  POST /v1/cases carrying the curator''s own typed slug verbatim, and lands on /cases/{slug}/versions/{version}
  using the version the response names, without ever reading that slug beforehand) would fail if the fact
  stopped holding.

  Certification of rules/knowledge/a-case-authoring-surface-offers-no-submission-while-required-content-is-absent
  did not hold: the auditor answered `partial` — The withholding half is exercised element-wise and would
  fail if it stopped holding: the single test loops the seven pieces of required content the node enumerates
  (the case''s slug, and the version''s title, when_to_use, subject and the fallback''s outcome, referral
  action and referral recipient), and for each asserts the act is not offered (the "Create case" control
  carries disabled), that clicking it creates no case (no POST), and that the statement standing in the
  act''s place names that piece. The statement half is exercised only one absence at a time: every iteration
  blanks exactly one field and fills the rest, and the surface''s own opening state — every required field
  still empty — is never mounted and read, so "states ... which of that required content is still absent"
  is exercised only in its singular case. A surface that named the first absent piece and stayed silent
  about the others would pass this test whole while that part of the fact had stopped holding. "Named
  against the field that would carry it" is asserted as a substring of the still-needed text (toContain(label));
  nothing ties that string to the field bearing it, so a statement naming content by a label no field
  on the surface carries would also pass. Two further facts a reader routes rather than ones settled here:
  the closing assertions — that the act is offered and the statement absent once all seven are filled
  — claim more than this node establishes, since the node states that where every piece of required content
  holds content "nothing here decides whether the act is offered"; they are also what keeps the loop falsifiable,
  since a control disabled unconditionally would satisfy every iteration. And the proof''s meaning of
  "absent" and "no case created" rests on fillForm, createFetchStub and postCallCount imported from ./case-creation-screen.test-support,
  which the pack did not offer as proof and which this certification therefore does not pin.. The node
  is decided by reading, and a certification standing on it from an earlier reconciliation is released
  by the bind. The remainder is testable: The required content is a declared, finite enumeration, so the
  remainder is a test over the absences the loop leaves out. One input: mount the surface untouched, with
  all seven pieces of required content absent, and then a case with two or more absent together. One expected
  result: the act is still not offered and no case is created, and the statement in the act''s place names
  every absent piece — each read through the field that would carry it (resolving the field by its own
  label and asserting the statement names that same field) rather than by a substring of the statement''s
  text..

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) contracts/knowledge/case-query,
  domain/knowledge/case, domain/knowledge/case-version, contracts/knowledge/case-lifecycle, rules/knowledge/a-case-listing-offers-a-route-to-author-a-new-case-on-every-reading,
  rules/knowledge/a-case-authoring-surface-offers-no-submission-while-required-content-is-absent, rules/knowledge/a-successful-case-version-creation-lands-on-the-created-versions-own-surface,
  rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug were read on every file
  and answered for, and bound from nowhere here — a binding this record writes is one the trace already
  held.

  Candidates: 6 opened across 3 of 13 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 7 fact(s) the source states that no node holds, over 6 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/case-creation-screen-corrective.returns/`, which are the evidence behind every entry above.
