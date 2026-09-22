---
contract_version: siegard-reconcile/5
title: Case-not-valid surface presentation corrective — version editor, manifest builder and hypothesis
  composition stay reachable on a version that does not read back as a case
summary: Three corrective tasks close the deadlock where a freshly created case's own version, once it
  failed a validation rule, made every downstream surface (the version editor, the manifest builder, and
  hypothesis composition) fall back to a generic "did not complete" statement instead of staying open
  — so a curator could never add the case's first hypothesis. Each surface now states explicitly that
  the version does not read back as a case, keeps offering its own act (editing, placing a hypothesis,
  composing a hypothesis) on that same reading, and a stale successful read left in the shared TanStack
  Query cache no longer leaks an attribute of the version through that statement. The human asserts these
  three tasks' own delivered behavior is correct as implemented; this reconciliation is not re-deciding
  that, only accounting for what the trace already binds to these files.
target: frontend
files:
- path: src/hooks/use-cases-list-invalid-case-isolation.spec.ts
  change: Pre-existing test file (from a prior, separate delivery) proving the cases-list isolation behavior;
    included in this review's file set as proof for the case-listing-related specification nodes this
    epic's tasks read but do not modify.
- path: src/hooks/use-cases-list.ts
  change: No functional change from this initiative; pre-existing case-listing isolation logic (isCaseListEntryNotValid)
    that the corrective epic's tasks build on but do not themselves modify.
- path: src/hooks/use-edit-draft-version-form.ts
  change: Added a "not-valid" phase, reached via the shared errorStateKind classification of CaseVersionNotValidError,
    that falls through the load-error and loading gates rather than collapsing into the generic failure
    statement.
- path: src/hooks/use-hypothesis-revision-form.ts
  change: Added isVersionNotValid/caseVersionNotValid classification; the composing ("ready") phase now
    falls through on a case-not-valid refusal rather than the load-error phase catching it. Introduced
    a single versionData binding, forced to undefined whenever isVersionNotValid holds, and every version-derived
    value (subjectType, collectsOptions filtering, pinnedRevision, the revise mutation's placeholder subject)
    now reads from versionData rather than versionQuery.data directly — the fix for a stale-cache leak
    a failure-diagnostician found in an earlier version of this same file, where a prior successful read
    left in the shared ["case-version", slug, version] query cache surfaced its subject type even once
    the same key's current read was refused.
- path: src/hooks/use-manifest-builder-unnamed-refusal-disclosure.spec.ts
  change: New test file proving, at the toast-mechanism level (which the DOM-only screen tests cannot
    observe), that a move refused with an unrecognized code raises only the fixed generic toast, never
    the refusal's own code or message.
- path: src/hooks/use-manifest-builder.ts
  change: Added a "not-valid" phase for the manifest builder, mirroring the version editor's; added removeErrorMessage/REMOVE_BLOCKED_MESSAGE
    state so a ManifestWouldHoldNoHypothesisError refusal (previously silent) now surfaces a curator-visible
    telling, matching the existing moveErrorMessage handling for ManifestPositionOccupiedError.
- path: src/routes/case-version-editor-screen-not-valid.spec.ts
  change: New test file proving the version editor's not-valid statement, its distinctness from the load-error
    statement, the Manifest route on every reading, and non-disclosure of the refusal's own code/message/cached
    attributes.
- path: src/routes/case-version-editor-screen-view-released-manifest-state.spec.ts
  change: Same direct edit as case-version-editor-screen-view-released.spec.ts, for the same reason, to
    the same two assertions.
- path: src/routes/case-version-editor-screen-view-released.spec.ts
  change: 'Two assertions changed from screen.queryByText("Manifest") to screen.queryByRole("heading",
    { name: "Manifest" }) — a stale assertion from a closed, archived initiative that had come to contradict
    the newly widened Manifest link (now also a "Manifest" link, not just a heading), edited directly
    per explicit user authorization outside the formal task route since it asserts a UI-form detail, not
    a business fact, and the formal corrective-increment route refused to bind because trace.py --encodes
    does not bind test files.'
- path: src/routes/case-version-editor-screen.test-support.ts
  change: Added an optional queryClient parameter to mountCaseVersionEditor so a test can pre-seed the
    shared case-version query cache before mounting, to exercise the stale-cache scenario.
- path: src/routes/case-version-editor-screen.tsx
  change: Added a not-valid branch rendering the case-keyed "does not read back as a case" statement,
    and widened the Manifest link to render on every phase (loading, load-error, not-valid, ready) rather
    than only the ready phase.
- path: src/routes/cases-list-screen-invalid-case-isolation.spec.ts
  change: Pre-existing test file (from a prior, separate delivery) proving the cases-list screen's own
    isolation rendering; included in this review's file set for the same reason as use-cases-list-invalid-case-isolation.spec.ts.
- path: src/routes/cases-list-screen.tsx
  change: No functional change from this initiative; pre-existing case-listing screen that renders the
    not-valid marker use-cases-list.ts already isolates.
- path: src/routes/hypothesis-revision-form-fields.tsx
  change: subjectType prop made nullable; the "Subject type (from draft, fixed)" input now renders blank
    rather than passing an unread or stale value through.
- path: src/routes/hypothesis-revision-screen-case-not-valid.spec.ts
  change: New test file proving the composition form and submit act stay presented/offered on a CaseVersionNotValidError
    refusal of the draft version's own read (both New Hypothesis and Revise Hypothesis entry points),
    that glossary/revisions failures and unmapped-code refusals keep the generic statement, and that the
    case-keyed statement discloses no attribute of the version even from a stale shared-key cache.
- path: src/routes/hypothesis-revision-screen.test-support.ts
  change: No functional change from this initiative; read as the fixture/harness backing hypothesis-revision-screen-case-not-valid.spec.ts.
- path: src/routes/hypothesis-revision-screen.tsx
  change: Renders the case-keyed not-valid statement above the composition form when the hook reports
    caseVersionNotValid, alongside the pre-existing form and "View Manifest" link, both now reachable
    on that reading exactly as on a successful one.
- path: src/routes/new-case-draft-screen.tsx
  change: Added a not-valid branch for type-narrowing consistency with case-version-editor-screen.tsx,
    since both consume the same EditDraftVersionFormState union.
- path: src/routes/version-manifest-screen-not-valid.spec.ts
  change: New test file proving the manifest builder's not-valid/load-error distinction, the add-hypothesis
    offer across every reading including withholding it on released, and non-disclosure of an unrecognized
    refusal's own code/message/cached manifest content.
- path: src/routes/version-manifest-screen-remove-refusal-telling.spec.ts
  change: New test file proving the manifest surface states the ManifestPositionOccupiedError and ManifestWouldHoldNoHypothesisError
    refusals distinctly from each other, and discloses nothing for a place/remove refused with any other
    code.
- path: src/routes/version-manifest-screen.test-support.ts
  change: Added an optional queryClient parameter to mountManifestScreen, mirroring the version-editor
    test-support change, to exercise the stale-cache scenario.
- path: src/routes/version-manifest-screen.tsx
  change: Extracted a shared AddHypothesisLink component, rendered on every phase (loading, load-error,
    not-valid, ready) and gated off only when state.isReleased — previously offered only on the ready
    phase and not gated on released state at all. RowActions now renders removeErrorMessage as a role="alert"
    paragraph alongside the existing moveErrorMessage one.
nodes:
- node: contracts/glossary/glossary-query
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at the vocabulary-option hooks the form''s outcome/action/recipient
    pickers draw on — const outcomeOptions = useGlossaryVocabularyOptions("outcome"); const actionOptions
    = useGlossaryVocabularyOptions("action"); const recipientOptions = useGlossaryVocabularyOptions("recipient");

    '
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: contracts/investigation/case-simulation
  conforms: true
  how: "src/routes/case-version-editor-screen.tsx: held at the Simulate link in the ready-phase branch,\
    \ lines 54-56 — <Link to=\"/cases/$slug/versions/$version/simulate\" params={{ slug, version }}>\n\
    \  Simulate\n</Link>"
  encoded_at:
  - src/routes/case-version-editor-screen.tsx
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at patchMutation (update-draft), releaseMutation\
    \ (release) and discardMutation (discard) — return apiFetch<CaseVersionRecord>(\n  `/v1/cases/${encodeURIComponent(slug)}/versions/${version}`,\n\
    \  {\n    method: \"PATCH\",\n    headers: { \"Content-Type\": \"application/json\" },\n    body:\
    \ JSON.stringify(values),\n  },\n);\n\nsrc/hooks/use-hypothesis-revision-form.ts: held at the reviseMutation's\
    \ mutationFn, issuing the revise-hypothesis operation — return apiFetch<RevisedHypothesis>(`/v1/cases/${encodeURIComponent(slug)}/hypotheses`,\
    \ {\n        method: \"POST\",\n...\n});\nsrc/hooks/use-manifest-builder.ts: held at the placeMutation\
    \ and removeMutation definitions, lines 96-171 — apiFetch<void>(\n  `/v1/cases/${encodeURIComponent(slug)}/versions/${version}/manifest/${encodeURIComponent(vars.hypothesisName)}`,\n\
    \  { method: \"PUT\", ... }\n)\napiFetch<void>(\n  `/v1/cases/${encodeURIComponent(slug)}/versions/${version}/manifest/${encodeURIComponent(vars.hypothesisName)}`,\n\
    \  { method: \"DELETE\" },\n)"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/hooks/use-manifest-builder.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at versionQuery's queryFn — queryFn: () =>\n  apiFetch<CaseVersionRecord>(\n\
    \    `/v1/cases/${encodeURIComponent(slug)}/versions/${version}`,\n  ),\n\nsrc/hooks/use-hypothesis-revision-form.ts:\
    \ held at the versionQuery and revisionsQuery queryFn calls — apiFetch<CaseVersionSubject>(`/v1/cases/${encodeURIComponent(slug)}/versions/${version}`)\n\
    ...\napiFetch<HypothesisRevisionsPage>(\n        `/v1/cases/${encodeURIComponent(slug)}/hypotheses/${encodeURIComponent(hypothesisName\
    \ ?? \"\")}/revisions`,\n      )\nsrc/hooks/use-manifest-builder.ts: held at the versionQuery definition,\
    \ lines 86-90 — queryFn: () =>\n  apiFetch<ManifestVersionRecord>(`/v1/cases/${encodeURIComponent(slug)}/versions/${version}`),\n\
    src/routes/cases-list-screen.tsx: held at the call that triggers the list-cases read, line 77 — const\
    \ casesQuery = useCasesList();"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/hooks/use-manifest-builder.ts
  - src/routes/cases-list-screen.tsx
- node: domain/glossary/action
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at actionOptions — const actionOptions = useGlossaryVocabularyOptions(\"\
    action\");\nsrc/hooks/use-hypothesis-revision-form.ts: held at the actionOptions binding, sourced\
    \ from the glossary and returned to the form — const actionOptions = useGlossaryVocabularyOptions(\"\
    action\");\nsrc/routes/hypothesis-revision-form-fields.tsx: held at the Referral action Select bound\
    \ to resolution.referral.action, lines 183-202 — <Select\n  value={field.value || null}\n  onChange={field.onChange}\n\
    \  onBlur={field.onBlur}\n  options={actionOptions.options}\n  disabled={isSubmitting}\n  placeholder=\"\
    Select an action\""
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/concept
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-hypothesis-revision-form.ts, src/routes/hypothesis-revision-form-fields.tsx,
    and src/hooks/use-edit-draft-version-form.ts read `nowhere` — const outcomeOptions = useGlossaryVocabularyOptions("outcome");
    const actionOptions = useGlossaryVocabularyOptions("action"); const recipientOptions = useGlossaryVocabularyOptions("recipient");
    — only these three vocabularies are fetched; concept never appears in this file, which composes no
    hypothesis-revision content. — a binding asserts the file answers for the node, so the pair that stopped
    holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/outcome
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at outcomeOptions — const outcomeOptions = useGlossaryVocabularyOptions(\"\
    outcome\");\nsrc/hooks/use-hypothesis-revision-form.ts: held at the outcomeOptions binding, sourced\
    \ from the glossary and returned to the form — const outcomeOptions = useGlossaryVocabularyOptions(\"\
    outcome\");\nsrc/routes/hypothesis-revision-form-fields.tsx: held at the Resolution outcome Select,\
    \ lines 157-175 — <Select\n  value={field.value || null}\n  onChange={field.onChange}\n  onBlur={field.onBlur}\n\
    \  options={outcomeOptions.options}"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/recipient
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at recipientOptions — const recipientOptions =\
    \ useGlossaryVocabularyOptions(\"recipient\");\nsrc/hooks/use-hypothesis-revision-form.ts: held at\
    \ the recipientOptions binding, sourced from the glossary and returned to the form — const recipientOptions\
    \ = useGlossaryVocabularyOptions(\"recipient\");\nsrc/routes/hypothesis-revision-form-fields.tsx:\
    \ held at the Referral recipient Select, lines 210-229 — <Select\n  value={field.value || null}\n\
    \  onChange={field.onChange}\n  onBlur={field.onBlur}\n  options={recipientOptions.options}"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/glossary/subject-type
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at resetFormFrom's default value for the form's\
    \ subject field — subject: record.subject,\nsrc/hooks/use-hypothesis-revision-form.ts: held at the\
    \ subjectType derivation, read from the version's own record — const subjectType = versionData ===\
    \ undefined ? null : versionData.subject;\nsrc/routes/hypothesis-revision-form-fields.tsx: held at\
    \ the read-only Subject type field, lines 95-97 — <FormField label=\"Subject type (from draft, fixed)\"\
    \ errorId=\"subject-error\">\n  <Input value={subjectType ?? \"\"} disabled readOnly />\n</FormField>"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/knowledge/case
  conforms: true
  how: "src/hooks/use-cases-list.ts: held at the `CaseIdentity` type and its use in `fetchCasesWithSummaries`\
    \ — type CaseIdentity = {\n  readonly slug: string;\n};\nsrc/hooks/use-edit-draft-version-form.ts:\
    \ held at the slug the hook is keyed by, threaded through the query key and every call — queryKey:\
    \ [\"case-version\", slug, version],\nsrc/routes/cases-list-screen.tsx: held at the row's own identity\
    \ and the navigation target, built from the case's slug alone, lines 40-41 and 86-91 — function handleRowClick(row:\
    \ StatusTableRow): void {\n  const slug = row.slug;\n  if (typeof slug !== \"string\") {\n    return;\n\
    \  }\n  void navigate({ to: \"/cases/$slug\", params: { slug } });\n}"
  encoded_at:
  - src/hooks/use-cases-list.ts
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/cases-list-screen.tsx
- node: domain/knowledge/case-summary
  conforms: true
  how: "src/hooks/use-cases-list.ts: held at the `CaseSummary` type and its construction in `fetchCaseListEntry`/`releasedInfo`\
    \ — export type CaseSummary = {\n  readonly versionCount: number;\n  readonly currentState?: CaseVersionState;\n\
    \  readonly lastUpdated?: string;\n  readonly title?: string;\n  readonly whenToUse?: string;\n  readonly\
    \ releasedVersion?: number;\n};\nsrc/routes/cases-list-screen.tsx: held at toRow's mapping of entry.summary\
    \ onto the row's state, versionCount and lastUpdated cells, lines 45-54 — const stateCell =\n  entry.summary.currentState\
    \ === undefined\n    ? { color: \"bg-muted\", label: NO_VERSION_YET_LABEL }\n    : CASE_STATE_CELL[entry.summary.currentState];\n\
    return {\n  id: entry.slug,\n  slug: entry.slug,\n  state: stateCell,\n  versionCount: entry.summary.versionCount,\n\
    \  lastUpdated: formatLastUpdated(entry.summary.lastUpdated),\n};"
  encoded_at:
  - src/hooks/use-cases-list.ts
  - src/routes/cases-list-screen.tsx
  decided_by: reading
  remainder: testable
  remainder_why: 'Two inputs against two expected results, each one reading of the listing. First: a case
    whose version listing answers a total of 0 with no versions, expected to resolve to a summary carrying
    version_count 0 with current_state and last_updated absent from the entry — not null, not a placeholder
    state — asserted by an equality over the whole entry so an invented value fails. Second: a case whose
    versions are all drafts and none released, expected to resolve to a summary carrying version_count,
    current_state "draft" and last_updated from its highest-numbered draft, with title, when_to_use and
    released_version absent — seeded, as the second existing test already does, with a draft title and
    when_to_use that would surface and fail the assertion if either were read from the draft.'
- node: domain/knowledge/case-version
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at resetFormFrom — form.reset({\n  title: record.title,\n\
    \  when_to_use: record.when_to_use,\n  subject: record.subject,\n  fallback: record.fallback,\n  consolidation_register:\
    \ record.consolidation_register,\n});\n\nsrc/hooks/use-hypothesis-revision-form.ts: held at the CaseVersionSubject\
    \ type and the versionQuery that answers it — type CaseVersionSubject = {\n  readonly subject: string;\n\
    \  readonly manifest: readonly ManifestEntryDto[];\n};\nsrc/hooks/use-manifest-builder.ts: held at\
    \ the sorted rows, isReleased and manifest read off versionQuery.data — const sorted = sortByPosition(versionQuery.data.manifest);\n\
    const isReleased = versionQuery.data.state === \"released\";\nsrc/routes/hypothesis-revision-form-fields.tsx:\
    \ held at the same read-only Subject type field, lines 95-97 — the only case-version attribute (subject)\
    \ this component touches; none of the version's other declared attributes (title, when_to_use, fallback,\
    \ consolidation_register, state, manifest) appear here — <Input value={subjectType ?? \"\"} disabled\
    \ readOnly />\nsrc/routes/hypothesis-revision-screen.tsx: held at the `caseVersionNotValid` conditional\
    \ in the composing branch — {state.caseVersionNotValid && (\n  <p>This case&apos;s current version\
    \ does not read back as a case.</p>\n)}\nsrc/routes/version-manifest-screen.tsx: held at state.isReleased\
    \ driving rowsDisabled and the AddHypothesisLink visibility — const rowsDisabled = state.isBlocked\
    \ || state.isBusy || state.isReleased;"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/hooks/use-manifest-builder.ts
  - src/routes/hypothesis-revision-form-fields.tsx
  - src/routes/hypothesis-revision-screen.tsx
  - src/routes/version-manifest-screen.tsx
- node: domain/knowledge/case-version-state
  conforms: false
  how: 'src/hooks/use-cases-list.ts, line 17, the `CaseVersionState` type declaration: export type CaseVersionState
    = "draft" | "released"; — The two literal values are decided by the specification''s own case-version-state
    enumeration, not by this file. This hook (and, independently, src/hooks/use-case-versions.ts, which
    declares the identical literal union on its own) each carry a private copy of that enumeration rather
    than deriving it from one shared declaration; if the specification''s set of states ever changes,
    nothing here reads that change, and a reader who finds three independent copies of "draft" | "released"
    has no way to tell which one is still authoritative.'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/cases-list-screen.tsx
- node: domain/knowledge/hypothesis
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at hypothesisNameEditable, keeping a hypothesis's\
    \ own name fixed once it exists — hypothesisNameEditable: hypothesisName === null,\nsrc/hooks/use-manifest-builder.ts:\
    \ held at the hypothesisName extraction and every call keyed by that name — const hypothesisName =\
    \ entry.hypothesis_revision.hypothesis.name;\nsrc/routes/hypothesis-revision-form-fields.tsx: held\
    \ at the Hypothesis name field, lines 87-92 — <Input\n  {...register(\"hypothesis_name\")}\n  disabled={!hypothesisNameEditable\
    \ || isSubmitting}\nsrc/routes/version-manifest-screen.tsx: held at row.hypothesisName used to label\
    \ and identify each manifest row — aria-label={`Move ${row.hypothesisName} up`}"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/hooks/use-manifest-builder.ts
  - src/routes/hypothesis-revision-form-fields.tsx
  - src/routes/version-manifest-screen.tsx
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at the HypothesisRevisionListItem type and the\
    \ form reset from its latest item — type HypothesisRevisionListItem = {\n  readonly revision: number;\n\
    \  readonly criterion: string;\n  readonly collects: readonly string[];\n  readonly resolution: HypothesisRevisionFormValues[\"\
    resolution\"];\n};\nsrc/hooks/use-manifest-builder.ts: held at the revision field read per entry and\
    \ repinTo's chosenRevision argument — const revision = entry.hypothesis_revision.revision;\nfunction\
    \ repinTo(chosenRevision: number): void { ... }\nsrc/routes/hypothesis-revision-form-fields.tsx: held\
    \ at the Criterion Textarea together with the Collects fieldset and the Resolution field group, lines\
    \ 100-231, which compose the revision's own content — criterion, collects and resolution — <Textarea\n\
    \  {...register(\"criterion\")}\n  disabled={isSubmitting}\nsrc/routes/version-manifest-screen.tsx:\
    \ held at row.revision and the fetched revisions populating RevisionSelect's options — const options\
    \ = optionsWithPinnedRevision(revisions, row.revision);"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/hooks/use-manifest-builder.ts
  - src/routes/hypothesis-revision-form-fields.tsx
  - src/routes/version-manifest-screen.tsx
- node: domain/knowledge/manifest-entry
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at the manifest passed through to the caller —\
    \ manifest: record.manifest,\nsrc/hooks/use-hypothesis-revision-form.ts: held at the ManifestEntryDto\
    \ type and pinnedRevisionFor's own lookup — const entry = manifest.find(\n    (item) => item.hypothesis_revision.hypothesis.name\
    \ === hypothesisName,\n  );\n  return entry === undefined ? null : entry.hypothesis_revision.revision;\n\
    src/hooks/use-manifest-builder.ts: held at ManifestEntryDto and moveTo, which changes only position,\
    \ never revision — function moveTo(target: ManifestEntryDto | undefined): void {\n  ...\n  placeMutation.mutate({\
    \ hypothesisName, revision, position: target.position, kind: \"move\" });\n}\nsrc/routes/version-manifest-screen.tsx:\
    \ held at toStatusRow, mapping each ManifestRow's position and pinned hypothesis to a table row —\
    \ position: row.position,"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
- node: domain/knowledge/referral
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at actionOptions/recipientOptions exposed for the\
    \ fallback's referral fields — outcomeOptions,\nactionOptions,\nrecipientOptions,\n\nsrc/routes/hypothesis-revision-form-fields.tsx:\
    \ held at the Referral action and Referral recipient FormFields, lines 178-230 — <FormField\n  label=\"\
    Referral action\"\n  errorId=\"resolution.referral.action-error\"\n  error={errors.resolution?.referral?.action?.message}\n\
    >"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
- node: domain/knowledge/resolution
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at outcomeOptions plus the fallback default value\
    \ — fallback: record.fallback,\nsrc/routes/hypothesis-revision-form-fields.tsx: held at the row pairing\
    \ Resolution outcome with the two referral fields, lines 151-231 — <div className=\"flex gap-4\">\n\
    \  <FormField\n    label=\"Resolution outcome\""
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-manifest-builder.ts, src/routes/version-manifest-screen.tsx,
    and src/hooks/use-edit-draft-version-form.ts read `nowhere` — manifest: record.manifest, — the manifest
    is only ever read and passed through; this file issues no remove-hypothesis call that could empty
    it. — a binding asserts the file answers for the node, so the pair that stopped holding it is released
    by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
  conforms: false
  how: "the fact left part of its ground: still held in src/routes/hypothesis-revision-screen.tsx, and\
    \ src/hooks/use-hypothesis-revision-form.ts read `nowhere` — export function useHypothesisRevisionForm(\n\
    \  slug: string,\n  version: number,\n  hypothesisName: string | null,\n): HypothesisRevisionFormState\
    \ { — the version is a caller-named identity, not resolved here from the case's slug alone as its\
    \ current highest-numbered version.; src/routes/hypothesis-revision-form-fields.tsx read `nowhere`\
    \ — export function HypothesisRevisionFormFields({\n  form,\n  hypothesisNameEditable,\n  subjectType,\n\
    \  collectsOptions,\n  outcomeOptions,\n  actionOptions,\n  recipientOptions,\n  isSubmitting,\n \
    \ onSubmit,\n  trailingActions,\n}: HypothesisRevisionFormFieldsProps): JSX.Element { — a binding\
    \ asserts the file answers for the node, so the pair that stopped holding it is released by `--bind\
    \ ... --replace`, never restamped here"
  observed_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/a-case-listing-offers-a-route-to-author-a-new-case-on-every-reading
  conforms: true
  how: "src/routes/cases-list-screen.tsx: held at the Create case button, placed outside renderBody()\
    \ so it stands on every one of the pending, error, empty and populated readings, lines 142-150 — <div\
    \ className=\"flex items-center justify-between\">\n  <h1 className=\"text-lg font-semibold text-foreground\"\
    >Cases</h1>\n  <Button type=\"button\" onClick={() => void navigate({ to: \"/cases/new\" })}>\n  \
    \  Create case\n  </Button>\n</div>\n{renderBody()}"
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone
  conforms: true
  how: "src/hooks/use-cases-list.ts: held at the try/catch around the highest version's detail fetch in\
    \ `fetchCaseListEntry` — } catch (error) {\n  if (errorStateKind(error) === \"case-not-valid\") {\n\
    \    return { slug, notValid: true };\n  }\n  throw error;\n}\nsrc/routes/cases-list-screen.tsx: held\
    \ at toRow's isCaseListEntryNotValid branch, lines 38-44 — if (isCaseListEntryNotValid(entry)) {\n\
    \  return {\n    id: entry.slug,\n    slug: entry.slug,\n    state: CURRENT_VERSION_NOT_VALID_STATEMENT,\n\
    \  };\n}"
  encoded_at:
  - src/hooks/use-cases-list.ts
  - src/routes/cases-list-screen.tsx
  decided_by: test
  step: test
  proof:
  - src/hooks/use-cases-list-invalid-case-isolation.spec.ts
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  conforms: true
  how: "src/routes/cases-list-screen.tsx: held at the undefined-guarded reads of currentState and lastUpdated,\
    \ which present the case-with-no-version absence rather than inventing a value, lines 27-35 and 45-48\
    \ — function formatLastUpdated(iso: string | undefined): string {\n  if (iso === undefined) {\n  \
    \  return NO_VERSION_YET_DASH;\n  }\nentry.summary.currentState === undefined\n    ? { color: \"bg-muted\"\
    , label: NO_VERSION_YET_LABEL }\n    : CASE_STATE_CELL[entry.summary.currentState];"
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at isReadOnly / isBlocked — isReadOnly: record.state
    === "released",


    src/hooks/use-manifest-builder.ts: held at the isReleased field computed and returned in the ready
    phase, line 186 and 238 — const isReleased = versionQuery.data.state === "released";

    return { phase: "ready", rows, isBlocked, isBusy, isReleased };

    src/routes/version-manifest-screen.tsx: held at rowsDisabled including state.isReleased, and AddHypothesisLink
    hidden once released — const rowsDisabled = state.isBlocked || state.isBusy || state.isReleased;'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at patchMutation.onError and releaseMutation.onError\
    \ — if (kind === \"case-version-not-draft\") {\n\n        setStatus(\"conflict\");\n\nsrc/hooks/use-manifest-builder.ts:\
    \ held at the case-version-not-draft branches of placeMutation.onError and removeMutation.onError\
    \ — if (kind === \"case-version-not-draft\") { setIsBlocked(true); return; }"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-manifest-builder.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-hypothesis-revision-form.ts, and
    src/hooks/use-edit-draft-version-form.ts read `nowhere` — body: JSON.stringify(values), — the PATCH
    body carries only the case-version''s own declared attributes (title, when_to_use, subject, fallback,
    consolidation_register); no concept is submitted or checked here. — a binding asserts the file answers
    for the node, so the pair that stopped holding it is released by `--bind ... --replace`, never restamped
    here'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
- node: rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at the effect resetting the form from versionQuery.data,\
    \ and the loading phase — if (versionQuery.data) {\n      resetFormFrom(form, versionQuery.data);\n\
    \      setStatus(\"clean\");\n    }\n\nsrc/hooks/use-hypothesis-revision-form.ts: held at subjectType/pinnedRevision\
    \ read only from versionData, and the loading phase — const subjectType = versionData === undefined\
    \ ? null : versionData.subject;\n...\npinnedRevision:\n    versionData === undefined ? null : pinnedRevisionFor(versionData.manifest,\
    \ hypothesisName),\nsrc/routes/hypothesis-revision-screen.tsx: held at the `loading` branch, which\
    \ presents no content while the anchoring read is pending — if (state.phase === \"loading\") {\n \
    \ return <p>Loading…</p>;\n}\nsrc/routes/new-case-draft-screen.tsx: held at the \"loading\" branch,\
    \ lines 11-13 — if (state.phase === \"loading\") { return <p>Loading…</p>; }"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-screen.tsx
  - src/routes/new-case-draft-screen.tsx
- node: rules/knowledge/a-hypothesis-composition-stands-on-a-reading-whose-anchoring-version-does-not-read-back-as-a-case
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at the \"ready\" phase reached when isVersionNotValid\
    \ is true, still returning form and onSubmit — caseVersionNotValid: isVersionNotValid,\n...\nisSubmitting:\
    \ reviseMutation.isPending,\nonSubmit: submit,\nsrc/routes/hypothesis-revision-screen.tsx: held at\
    \ the composing return block, which renders the composition's fields and the submit act unconditionally,\
    \ `caseVersionNotValid` included — <HypothesisRevisionFormFields\n  form={state.form}\n  hypothesisNameEditable={state.hypothesisNameEditable}\n\
    \  subjectType={state.subjectType}\n  collectsOptions={state.collectsOptions}\n  outcomeOptions={state.outcomeOptions}\n\
    \  actionOptions={state.actionOptions}\n  recipientOptions={state.recipientOptions}\n  isSubmitting={state.isSubmitting}\n\
    \  onSubmit={state.onSubmit}"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-screen.tsx
  decided_by: reading
  remainder: testable
  remainder_why: One input per named inclusion against one expected result. Mount the composing surface
    with GET .../versions/{version} refused by CaseVersionNotValidError whose payload names the empty
    manifest as the failing validator rule, and again with one naming v's own declared subject type as
    the failing attribute; in each, assert the composition's fields are present and the "Save hypothesis"
    act is offered and, on click, issues the POST — identically to the detail-less refusal. Add the revise
    entry point (revisePath("H1")) on a refused reading as a third input, asserting that clicking the
    offered act issues the revise-hypothesis for H1 rather than only that the control renders.
- node: rules/knowledge/a-hypothesis-composition-states-which-of-its-reads-did-not-complete
  conforms: false
  how: "src/hooks/use-hypothesis-revision-form.ts, the `HypothesisRevisionFormState` union's `load-error`\
    \ variant (line 52) and the branch that returns it (lines 242-256): | { readonly phase: \"load-error\"\
    ; readonly retryLoad: () => void }\n...\nif (isGlossaryError || isRevisionsError || (versionQuery.isError\
    \ && !isVersionNotValid)) {\n    return {\n      phase: \"load-error\",\n      retryLoad: () => {\n\
    \        void versionQuery.refetch();\n        if (hypothesisName !== null) {\n          void revisionsQuery.refetch();\n\
    \        }\n        conceptOptions.refetch();\n        outcomeOptions.refetch();\n        actionOptions.refetch();\n\
    \        recipientOptions.refetch();\n      },\n    };\n  } — A curator whose glossary read failed,\
    \ one whose hypothesis-revisions read failed, and one whose case-version read failed for a reason\
    \ this surface does not recognise all land on the identical `load-error` phase, with no field saying\
    \ which read did not complete; `retryLoad` then re-issues all five queries regardless of which one\
    \ actually failed, so the curator can neither tell which read to retry nor have the surface retry\
    \ only that one, though the node requires the two statements — glossary-or-revisions did not complete,\
    \ versus the case version did not complete — to be told apart, and the glossary and revisions cases\
    \ from each other.\nsrc/routes/hypothesis-revision-screen-case-not-valid.spec.ts, LOAD_ERROR_TEXT\
    \ (line 30) asserted identically for the glossary/revisions-read failures (lines 184, 199) and for\
    \ the draft version's own read failing to complete or being refused with an unrecognized code (lines\
    \ 230, 248): const LOAD_ERROR_TEXT = \"Unable to load this form right now.\"; ... expect(await screen.findByText(LOAD_ERROR_TEXT)).toBeTruthy();\
    \ (glossary failure, line 184; hypothesis-revisions failure, line 199; unmapped GET VERSION_PATH refusal,\
    \ line 230; GET VERSION_PATH network failure, line 248) — a curator whose own anchoring-version read\
    \ stalls or is refused for an unrecognized reason sees the exact same notice a curator sees when only\
    \ the glossary or the hypothesis's own revisions failed to load, so nothing on screen tells them which\
    \ of the three reads to retry — the confusion the node's distinctness requirement exists to rule out.\n\
    src/routes/hypothesis-revision-screen.tsx, the `load-error` branch, lines 24-33: if (state.phase ===\
    \ \"load-error\") {\n  return (\n    <section>\n      <p>Unable to load this form right now.</p>\n\
    \      <Button type=\"button\" onClick={state.retryLoad}>\n        Retry\n      </Button>\n    </section>\n\
    \  );\n} — A curator whose composing surface failed to read the glossary's terms (so a concept, outcome,\
    \ action or recipient option list came back empty or unusable) and a curator whose read of the hypothesis's\
    \ own revisions failed (so they cannot see what a submit would overwrite) both see the identical text\
    \ and the identical Retry control as a curator whose read of the anchoring case version never completed\
    \ at all. Nothing on the surface names which of the three reads is the one to retry, so the curator\
    \ cannot tell a failure that leaves the anchor unknown from one that leaves the anchor known and only\
    \ a side list unfilled, and the one distinction the node exists to make usable is not made."
  observed_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-form.ts: held at pinnedRevisionFor''s manifest.find lookup,
    reading at most one entry per hypothesis — manifest.find((item) => item.hypothesis_revision.hypothesis.name
    === hypothesisName)'
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at the reviseMutation's POST, anchored to the\
    \ case's slug and trusting server enforcement — return apiFetch<RevisedHypothesis>(`/v1/cases/${encodeURIComponent(slug)}/hypotheses`,\
    \ {\n        method: \"POST\","
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  conforms: true
  how: "src/hooks/use-manifest-builder.ts: held at the manifest-position-occupied branch of placeMutation.onError,\
    \ lines 131-135 — if (kind === \"manifest-position-occupied\") {\n\n  setMoveError({ hypothesisName:\
    \ vars.hypothesisName, message: MOVE_BLOCKED_MESSAGE });"
  encoded_at:
  - src/hooks/use-manifest-builder.ts
- node: rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at pinnedRevisionFor reading the entry's own reference\
    \ — entry === undefined ? null : entry.hypothesis_revision.revision;\nsrc/routes/version-manifest-screen.tsx:\
    \ held at optionsWithPinnedRevision — if (options.some((option) => option.value === pinnedValue))\
    \ {\n  return options;\n}\nreturn [...options, { value: pinnedValue, label: pinnedValue }];"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for
  conforms: false
  how: "src/hooks/use-manifest-builder.ts, the case-version-not-draft branch of placeMutation.onError\
    \ (lines 126-130) and of removeMutation.onError (lines 158-162): if (kind === \"case-version-not-draft\"\
    ) {\n\n  setIsBlocked(true);\n  return;\n} — The node holds a presentation of its own for exactly\
    \ two refusals of the acts that compose the manifest — ManifestPositionOccupiedError and ManifestWouldHoldNoHypothesisError\
    \ — and says every other refusal either place-hypothesis or remove-hypothesis carries is presented\
    \ as the undifferentiated notice a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete\
    \ names, disclosing nothing further. CaseVersionNotDraftError, which a-case-version-moves-through-its-declared-lifecycle\
    \ names for exactly this call, is one of those \"every other\" refusals, yet this hook gives it a\
    \ third, distinct, persistent state (`isBlocked`, never reset back to false anywhere in the file)\
    \ instead of the same generic toast every unrecognised refusal gets. A reader who goes to the specification\
    \ to learn why a manifest write is \"blocked\" differently from any other failure finds no node that\
    \ grants that third distinction, and the next person adding a fourth will point at this branch as\
    \ precedent rather than at a decided boundary.\nsrc/hooks/use-manifest-builder.ts, the repin fallback\
    \ in placeMutation.onError, lines 136-140: if (vars.kind === \"repin\") {\n\n  setRevisionError({\
    \ hypothesisName: vars.hypothesisName, message: REVISION_FAILURE_MESSAGE });\n}\ntoast.error(GENERIC_FAILURE_MESSAGE);\
    \ — The node's own expression is that a place-hypothesis refused with any error code other than ManifestPositionOccupiedError\
    \ is told \"that the request failed for a reason the surface does not recognise and nothing else —\
    \ not the error code, not the refusal's message, not any value it carries.\" Here, whenever the underlying\
    \ call was a repin, an unrecognised refusal additionally sets a row-scoped message — \"Could not switch\
    \ to that revision. Try again.\" — naming which act failed, on top of the generic toast. That is a\
    \ third named presentation the node forecloses; a reader checking the specification for what a repin\
    \ failure discloses beyond \"something went wrong\" will not find this distinction there."
  observed_at:
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
  conforms: true
  how: 'src/routes/version-manifest-screen.tsx: held at AddHypothesisLink rendered in loading, load-error
    and not-valid phases, hidden only when state.isReleased — {!state.isReleased && <AddHypothesisLink
    slug={slug} version={version} />}'
  encoded_at:
  - src/routes/version-manifest-screen.tsx
  decided_by: reading
  remainder: testable
  remainder_why: 'Two assertions close it. One input — the surface mounted for a version whose read is
    refused with a code the screen holds no presentation of its own for — against one expected result:
    the placing offered, alongside the read-did-not-complete statement already asserted there. And, on
    each reading the node carries the offer through that currently asserts the control by name only (read
    pending, read failed to complete, answer stating draft with no entry, answer stating draft with entries),
    the same expected result the refused reading already states — the control targeting this version''s
    own new-hypothesis route — so that the offer proven present is the act that issues a place-hypothesis
    over v.'
- node: rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives
  conforms: true
  how: 'src/routes/new-case-draft-screen.tsx: held at the "loading" branch, lines 11-13 — the same branch,
    which renders no button and issues no act — if (state.phase === "loading") { return <p>Loading…</p>;
    }'
  encoded_at:
  - src/routes/new-case-draft-screen.tsx
- node: rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
  conforms: true
  how: "src/routes/case-version-editor-screen.tsx: held at the Manifest link, repeated identically in\
    \ the loading, load-error, not-valid and ready branches (lines 17-19, 31-33, 42-44, 57-59) — <Link\
    \ to=\"/cases/$slug/versions/$version/manifest\" params={{ slug, version }}>\n  Manifest\n</Link>"
  encoded_at:
  - src/routes/case-version-editor-screen.tsx
  decided_by: reading
  remainder: testable
  remainder_why: Four assertions close it, each one input against one expected result. On the pending
    reading, the failed reading and the reading that answered a validated case, assert the Manifest route's
    target is this same version's manifest — the href /cases/<the slug the reader named>/versions/3/manifest,
    the assertion the refused reading already carries — so a route pointing at another version of the
    case fails. Mount a reading of a released version and assert the same route is present with the same
    target, so presence turning on the version's state fails. Mount the surface presenting no case version
    and assert no route to any version's manifest is offered.
- node: rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state
  conforms: true
  how: 'src/routes/version-manifest-screen.tsx: held at PinnedRevisionStateBadge, rendered both while
    revisions are loading and once loaded — <PinnedRevisionStateBadge cell={pinnedStateCell} />'
  encoded_at:
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-edit-draft-version-form.ts, src/hooks/use-hypothesis-revision-form.ts,
    src/routes/case-version-editor-screen.tsx, src/routes/version-manifest-screen.tsx, and src/hooks/use-manifest-builder.ts
    read `nowhere` — this node is written over a surface a reader named by slug alone; this hook''s read
    is keyed by slug together with version — `queryKey: ["case-version", slug, version]` and `/v1/cases/${slug}/versions/${version}`
    — so the fallback its "load-error" phase supplies belongs to a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
    rather than to this node — a binding asserts the file answers for the node, so the pair that stopped
    holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/hooks/use-manifest-builder.ts
  - src/routes/case-version-editor-screen.tsx
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-edit-draft-version-form.ts, and
    src/hooks/use-manifest-builder.ts read `nowhere` — moveTo and repinTo call placeMutation.mutate with
    no check of the referenced hypothesis-revision''s own state, consistent with the node''s own text
    that "place-hypothesis is never refused by this rule, whatever state the revision it references is
    in"; src/routes/version-manifest-screen.tsx read `nowhere` — this screen discloses each pin''s own
    state via PinnedRevisionStateBadge but does not itself attempt or refuse a release; the release act
    and its refusal are not made here — a binding asserts the file answers for the node, so the pair that
    stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/a-revise-answers-the-revision-number-it-saved
  conforms: true
  how: 'src/routes/hypothesis-revision-screen.tsx: held at the `success` branch''s message — Hypothesis
    &quot;{state.hypothesisName}&quot; saved as revision {state.revision}.'
  encoded_at:
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at the \"success\" phase's offerManifestBuilder\
    \ — offerManifestBuilder: pinnedBeforeSave === null || revision > pinnedBeforeSave,\nsrc/routes/hypothesis-revision-screen.tsx:\
    \ held at the `success` branch's conditional button — {state.offerManifestBuilder && (\n  <Button\
    \ type=\"button\" onClick={state.onOpenManifestBuilder}>\n    Open Manifest Builder\n  </Button>\n\
    )}"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/a-revise-reads-its-drafts-declared-subject-type-even-when-that-draft-does-not-read-back-as-a-case
  conforms: false
  how: 'no named file holds this fact now: src/hooks/use-hypothesis-revision-form.ts read `nowhere` —
    const subjectType = versionData === undefined ? null : versionData.subject; — the concept- acceptance
    check itself is server-side; this hook has no local subject type to read once the version''s own read
    is refused, and falls back to null rather than the draft''s own stored value.'
  observed_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: rules/knowledge/a-surface-offering-release-states-which-release-conditions-the-draft-meets
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at releaseCondition and the conditions array —\
    \ const releaseCondition = manifestPinReleaseCondition(\n  record.manifest ?? [],\n  manifestPinnedStates,\n\
    );\n"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
  conforms: false
  how: 'src/routes/case-version-editor-screen.tsx, the `state.phase === "not-valid"` branch, the paragraph
    text at line 41: <p>This case&apos;s current version does not read back as a case.</p> — This screen
    is reached by naming both the case''s slug and a specific version number (`useParams({ from: "/cases/$slug/versions/$version"
    })`), and the hook backing it queries exactly that (slug, version) pair (`/v1/cases/${slug}/versions/${version}`)
    — the version the curator named may or may not be the case''s current, highest-numbered version. Telling
    the curator "this case''s current version does not read back as a case" states a different domain
    fact than the one the read actually answered: a curator who opened an older or superseded version
    and met a validation failure on that specific version is told, instead, that the case''s current version
    is invalid — which may be false, and which points the curator at the wrong version to correct.

    src/routes/version-manifest-screen.tsx, the `state.phase === "not-valid"` branch, the paragraph shown
    to the curator: <p>This case&apos;s current version does not read back as a case.</p> — This screen
    is reached by naming a case''s slug together with a specific version number (`useParams({ from: "/cases/$slug/versions/$version/manifest"
    })`), so the version on screen is the one the curator named, not necessarily the case''s highest-numbered
    ("current") version. Telling them "the case''s current version" fails to read back states a fact about
    a version they may not even be looking at — a curator who opened an older version by number, and hit
    this branch because that older version itself fails validation, is pointed at the wrong version to
    correct, and cannot tell from this text whether the version in front of them or some other version
    of the case is the one at fault.'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-manifest-builder.ts
  - src/routes/case-version-editor-screen.tsx
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/an-abandoned-case-version-edit-writes-nothing
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at onCancel / cancelEditing — const cancelEditing\
    \ = (): void => {\n  router.history.back();\n};\n"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/an-abandoned-revision-composition-writes-nothing
  conforms: false
  how: "the fact left part of its ground: still held in src/hooks/use-hypothesis-revision-form.ts, and\
    \ src/routes/hypothesis-revision-form-fields.tsx read `nowhere` — <Button type=\"submit\" form={HYPOTHESIS_REVISION_FORM_ID}\
    \ disabled={isSubmitting}>\n  Save hypothesis\n</Button>\n{trailingActions}; src/routes/hypothesis-revision-screen.tsx\
    \ read `nowhere` — <Button type=\"button\" variant=\"secondary\" onClick={state.onCancel}>\n  Cancel\n\
    </Button> — a binding asserts the file answers for the node, so the pair that stopped holding it is\
    \ released by `--bind ... --replace`, never restamped here"
  observed_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-edit-draft-version-form.ts, src/hooks/use-hypothesis-revision-form.ts,
    and src/routes/hypothesis-revision-form-fields.tsx read `nowhere` — {collectsOptions.map((concept)
    => { — a binding asserts the file answers for the node, so the pair that stopped holding it is released
    by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-form-fields.tsx
- node: rules/knowledge/every-position-declares-a-resolution
  conforms: true
  how: "src/routes/hypothesis-revision-form-fields.tsx: held at the Resolution outcome, Referral action\
    \ and Referral recipient fields rendered together, lines 151-231 — <div className=\"flex gap-4\">\n\
    \  <FormField\n    label=\"Resolution outcome\""
  encoded_at:
  - src/routes/hypothesis-revision-form-fields.tsx
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: 'src/hooks/use-manifest-builder.ts: held at sortByPosition and the index-derived canMoveUp/canMoveDown
    — function sortByPosition(manifest) { return [...manifest].sort((a, b) => a.position - b.position);
    }

    canMoveUp: index > 0,

    canMoveDown: index < lastIndex,

    src/routes/version-manifest-screen.tsx: held at the position column and the move up/down controls
    — { key: "position", header: "#" }'
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at canDiscard — canDiscard: record.state === "draft"
    && !isReleased,'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at releaseMutation.onError — setReleaseViolations(extractReleaseViolations(error));'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: scenarios/knowledge/placing-a-manifest-entry-is-never-refused-for-a-drafts-revision-state
  conforms: true
  how: "src/hooks/use-manifest-builder.ts: held at moveTo and repinTo, which gate on nothing but the mutation's\
    \ own outcome — function moveTo(target: ManifestEntryDto | undefined): void {\n  if (target === undefined)\
    \ { return; }\n  setMoveError(null);\n  setRevisionError(null);\n  placeMutation.mutate({ hypothesisName,\
    \ revision, position: target.position, kind: \"move\" });\n}\nsrc/routes/version-manifest-screen.tsx:\
    \ held at optionsWithPinnedRevision / RevisionSelect, listing every fetched revision unfiltered by\
    \ state — const options = optionsWithPinnedRevision(revisions, row.revision);"
  encoded_at:
  - src/hooks/use-manifest-builder.ts
  - src/routes/version-manifest-screen.tsx
unstated:
- file: src/routes/new-case-draft-screen.tsx
  where: line 33, the isFirstVersion disclosure inside the final return block
  evidence: '{state.isFirstVersion && <p>This is the case&apos;s first version.</p>}'
  cost: The screen tells the curator, as a stated fact, whether the draft being composed is the case's
    very first version. No node in the specification authorizes a new-draft-authoring surface to disclose
    this, fixes when it should be shown, or states the wording — unlike the closely neighbouring disclosures
    this same family of nodes governs in detail (a case's current version not reading back, a read not
    completing, and so on). A later reader auditing what this screen is entitled to tell a curator will
    not find this fact in the specification and cannot tell whether it is a deliberate business decision
    or drift the code introduced on its own.
unbound:
- src/hooks/use-cases-list-invalid-case-isolation.spec.ts
- src/hooks/use-manifest-builder-unnamed-refusal-disclosure.spec.ts
- src/routes/case-version-editor-screen-not-valid.spec.ts
- src/routes/case-version-editor-screen-view-released-manifest-state.spec.ts
- src/routes/case-version-editor-screen-view-released.spec.ts
- src/routes/case-version-editor-screen.test-support.ts
- src/routes/cases-list-screen-invalid-case-isolation.spec.ts
- src/routes/hypothesis-revision-screen-case-not-valid.spec.ts
- src/routes/hypothesis-revision-screen.test-support.ts
- src/routes/version-manifest-screen-not-valid.spec.ts
- src/routes/version-manifest-screen-remove-refusal-telling.spec.ts
- src/routes/version-manifest-screen.test-support.ts
notes: 'Judged by 22 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/case-not-valid-surface-presentation-corrective-3.returns/.

  Certification of rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
  did not hold: the auditor answered `partial` — Three of the fact''s four conjuncts are exercised on
  both surfaces and would fail if they stopped holding: the explicit statement on a reading where a validator
  rule does not hold (the 409 CaseVersionNotValidError), the distinguishability from a read that did not
  complete in both directions (not-valid present with the load-error text absent, and load-error text
  present with the not-valid statement absent on an unrecognized code), and the silence where every validator
  rule holds (the not-valid statement asserted absent once the same version reads back). The withholding
  conjunct is not exercised whole. Of the attributes the node enumerates, nothing in either file submits
  authored_at or released_at: the refusal payloads carry title, when_to_use, subject, fallback, consolidation_register
  and state, so a surface that leaked the version''s authored_at or released_at beside the statement would
  pass every named test. Within the manifest, an entry''s position and the hypothesis revision an entry
  references are not asserted absent by their own values — the editor''s payload carries the bare string
  "SECRET-MANIFEST-ENTRY" rather than an entry at all, and the manifest screen asserts only the hypothesis
  label''s absence and that no table renders, which leaves a position or a pinned revision rendered outside
  a table unexercised. "No fact derived from any of them" is likewise unexercised: every assertion is
  the absence of a literal value the refusal carried, so a derived rendering (a formatted date, a count
  of entries, a state badge) is not reached. Two further facts for a reader to route rather than for this
  audit to settle. First, both files assert the same fixed string "This case''s current version does not
  read back as a case." — wording the node consigns to the interface, but it names the case''s current
  version where this node''s reader named a slug together with a version number, which is the identity
  the neighbouring case-keyed node is written over; whether that statement states the fact about the version
  at (s, n) is a question about the wording, and it is not one the tests decide. Second, that the reading
  under test is one the reader named by slug and version number rests on the mount harnesses and path
  constants in case-version-editor-screen.test-support and version-manifest-screen.test-support, which
  the pack did not offer as proof and which I did not open; within the offered proof the named identity
  is assumed rather than asserted.. The node is decided by reading, and a certification standing on it
  from an earlier reconciliation is released by the bind. The remainder is testable: One input against
  one expected result, per surface: a CaseVersionNotValidError refusal for a version the reader named
  by slug and version number, carrying that version''s authored_at and released_at and a manifest entry
  whose position and pinned hypothesis revision are distinguishable literals, plus a value derived from
  one of them (a formatted authored_at or an entry count); the expected result is that the surface states
  the version named does not read back as a case and renders none of those values anywhere on the surface,
  asserted by their own text rather than by the absence of the table that would hold them..

  Certification of rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
  did not hold: the auditor answered `partial` — The presence half of the fact is exercised across all
  four readings the node names: the second test mounts the version editor with a read that never answers,
  a read that failed with an unrecognized code, a read that answered a validated case, and a read refused
  for validation, and each mount fails if no element with role link and accessible name "Manifest" is
  there. What goes unexercised is the rest of what the node states. First, "the manifest of that same
  v, and never to the manifest of any other version of c": only the first test asserts the link''s target,
  and only on the reading refused for validation; on the pending, failed and successful readings the second
  test asserts presence alone despite its name saying "targeting this same version", so a surface that
  offered a Manifest route pointing at some other version of the case — the plausible failure on the pending
  and failed readings, where no record has been read back to take a version number from — would pass this
  set. Second, "not on which of draft or released v''s state holds": every reading in the set is of the
  one version the shared handlers serve, so no reading presents a released version and the state half
  of the independence claim is never put to a test. Third, "A surface presenting no case version carries
  no such route": nothing in the set mounts a surface presenting no case version, so the negative half
  stands unexercised. Beyond that, the fact is written over "a surface presenting one case version a reader
  named", and the offered proof reaches one such surface, the version editor; where another surface keyed
  by the same slug and version number presents that version, the fact''s hold there is proved by tests
  outside the offered set, if at all.. The node is decided by reading, and a certification standing on
  it from an earlier reconciliation is released by the bind. The remainder is testable: Four assertions
  close it, each one input against one expected result. On the pending reading, the failed reading and
  the reading that answered a validated case, assert the Manifest route''s target is this same version''s
  manifest — the href /cases/<the slug the reader named>/versions/3/manifest, the assertion the refused
  reading already carries — so a route pointing at another version of the case fails. Mount a reading
  of a released version and assert the same route is present with the same target, so presence turning
  on the version''s state fails. Mount the surface presenting no case version and assert no route to any
  version''s manifest is offered..

  Certification of rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  did not hold: the auditor answered `partial` — On all three surfaces a refusal carrying an unrecognised
  code is exercised, and the tests would fail if the surface disclosed the code, the refusal''s own message,
  a value the refusal carries, or the not-read-back-as-a-case statement in place of the read-did-not-complete
  one. Two stated parts are left short. First, the statement being the same one the surface makes for
  any read of that case that did not complete, indistinguishable from it: only hypothesis-revision-screen-case-not-valid.spec.ts
  puts the two readings side by side and asserts one text for both; version-manifest-screen-not-valid.spec.ts
  reaches the same text for a transport failure only incidentally, inside the add-hypothesis test, on
  the way to asserting the link; and case-version-editor-screen-not-valid.spec.ts never exercises a read
  of the version that did not complete at all — both of its failing readings carry the unrecognised code
  — so the editor could begin stating one thing for an unnamed refusal and another for a read that did
  not complete and every named test would still pass. Second, "no attribute of c or of any version of
  c": each surface excludes only the attributes the refusal itself carries in its payload, and an attribute
  reaching the statement from elsewhere is excluded only on the version editor, whose cached-payload test
  seeds the case-version key before the unrecognised refusal. Nothing in the manifest or hypothesis-composition
  proof seeds that key before an unrecognised refusal, so a manifest table or version attribute left from
  an earlier successful read rendered beside the read-did-not-complete notice would break the fact on
  those two surfaces without failing any named test — their cache-seeding tests sit on the not-read-back-as-a-case
  branch, which is a different node''s statement.. The node is decided by reading, and a certification
  standing on it from an earlier reconciliation is released by the bind. The remainder is testable: Two
  assertions close it. For the version editor: one input — a read of the version that did not complete,
  a transport failure rather than a refusal — against the result that the screen states exactly the text
  it states for a refusal whose code it holds no presentation for, the two readings asserted in one test
  as the hypothesis-composition proof already does. For the manifest screen and the hypothesis-composition
  screen: one input — the case-version query key seeded with a manifest and version attributes from an
  earlier successful read, then that same read refused with a code the screen holds no presentation for
  — against the result that the screen states only the read-did-not-complete statement, with no seeded
  manifest entry and no seeded attribute of the case or of its version present..

  Certification of rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
  did not hold: the auditor answered `partial` — Five of the readings the node enumerates are exercised
  and the one withholding is exercised against it: the read not yet answered, the read that failed to
  complete, the read refused by name for validation, the answer stating draft with entries and the answer
  stating draft with no entry at all each assert the offer present, and the answer stating released asserts
  it absent. Two stated parts go unexercised. First, the node carries the offer through "a read of v refused,
  whatever the refusal named, the refusal a-case-version-failing-validation-at-a-read-is-refused-by-name
  states included" — only that one named refusal is exercised for the offer. The same file builds a refusal
  carrying a code the screen holds no presentation of its own for (`unrecognizedResponseCarrying`, `SomeUnrecognizedError`
  at 500) and asserts only the read-did-not-complete statement there, nothing about the placing; a surface
  that withheld the offer on every refusal but the validation one would leave every named assertion passing.
  Second, the node states the offer as "an act whose performance issues a place-hypothesis over v", and
  only the reading refused for validation asserts the control''s target is this version''s own new-hypothesis
  route; on the pending, failed-to-complete, empty-draft and draft-with-entries readings the assertion
  is the accessible name "+ Add hypothesis" alone, so a control offered there that did not issue a placing
  over v would not be caught.. The node is decided by reading, and a certification standing on it from
  an earlier reconciliation is released by the bind. The remainder is testable: Two assertions close it.
  One input — the surface mounted for a version whose read is refused with a code the screen holds no
  presentation of its own for — against one expected result: the placing offered, alongside the read-did-not-complete
  statement already asserted there. And, on each reading the node carries the offer through that currently
  asserts the control by name only (read pending, read failed to complete, answer stating draft with no
  entry, answer stating draft with entries), the same expected result the refused reading already states
  — the control targeting this version''s own new-hypothesis route — so that the offer proven present
  is the act that issues a place-hypothesis over v..

  Certification of rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for
  did not hold: the auditor answered `partial` — What the named test exercises is that each of the two
  named refusals raises some non-empty alert in the affected row and that the two texts differ from each
  other, and that for a place or a remove refused with another code no row alert appears and neither the
  code nor the message is rendered as a whole text node. Five stated parts of the fact go unexercised.
  First, neither named telling''s content is asserted: both statements are checked only by `expect(...textContent).toBeTruthy()`,
  so a surface that said nothing about a different hypothesis already holding the position the placement
  named, and nothing about the manifest having to declare at least one hypothesis, passes unchanged —
  any non-empty string, including the unrecognised-failure wording itself, satisfies both assertions.
  Second, "each stating that the manifest stands exactly as it stood before the act" is asserted nowhere:
  after neither refusal does the test read the manifest back, so a surface that dropped that clause, or
  that re-rendered the manifest as moved or as missing the entry the removal named, still passes. Third,
  that the entry the removal named is still held is likewise never read back. Fourth, the positive half
  of the other-code branch is missing: the fact requires every other refusal be "presented instead as
  the notice that surface shows for a request that failed for a reason it does not recognise", and the
  test asserts only the absence of a row alert and of the two strings — a surface that swallowed the other-code
  refusal silently and showed no notice at all passes both other-code readings. Fifth, because that generic
  notice is never captured, the fact''s requirement that the two named statements be distinguishable "from
  the statement the surface makes for a place-hypothesis or remove-hypothesis refused with any other error
  code" is unexercised; only the two named statements are compared, to each other. The non-disclosure
  assertions that are present are also narrower than the fact: `screen.queryByText("SomeOtherRefusalCode")`
  and `queryByText("SECRET-REFUSAL-MESSAGE")` match a whole normalised text node, so a notice rendering
  either inside a longer sentence would not be found and the test would pass while the surface disclosed
  it; and "not any value it carries" is exercised for no carried value beyond the code and the message..
  The node is decided by reading, and a certification standing on it from an earlier reconciliation is
  released by the bind. The remainder is testable: Four inputs against four expected rendered results,
  each read off the screen rather than off truthiness. (1) A place-hypothesis over v refused with ManifestPositionOccupiedError:
  assert the surface''s statement names that v''s manifest already places a different hypothesis at the
  position the placement named and that the manifest stands unchanged, and assert the manifest rows and
  their order read back exactly as before the move. (2) A remove-hypothesis over v refused with ManifestWouldHoldNoHypothesisError:
  assert the statement names that v''s manifest declares at least one entry and that the entry the removal
  named is still held, and assert that entry is still present in the manifest read back. (3) and (4) A
  place and a remove refused with any other code: assert the unrecognised-failure notice the surface shows
  for a request that failed for a reason it does not recognise is present, assert its text is distinguishable
  from each of the two statements captured in (1) and (2), and assert non-disclosure with a substring
  matcher over the whole rendered surface — the error code, the refusal message, and any further value
  the refusal carries appear nowhere in it..

  Certification of rules/knowledge/a-hypothesis-composition-stands-on-a-reading-whose-anchoring-version-does-not-read-back-as-a-case
  did not hold: the auditor answered `partial` — The two presences are exercised on the refused reading:
  with the read of v refused by CaseVersionNotValidError, the first test asserts the composition''s own
  fields ("Hypothesis name") and the offered act ("Save hypothesis") stand on both entry points, and the
  second asserts that performing the act issues the revise-hypothesis built from the composed content,
  so a screen that withheld either would fail. What goes unexercised is the invariance the fact states
  over the refusal itself. Every mount in the set uses one refusal fixture — apiErrorResponse("CaseVersionNotValidError",
  409, "validation failed") — carrying no indication of which validator rule failed, so nothing submits
  a refusal whose failing rule is v''s manifest holding no entry at all, and nothing submits one whose
  failing attribute is v''s own declared subject type. A screen that presented the composition only for
  a detail-less refusal and withheld the fields or the act once the refusal named a failing rule would
  pass every test here; the clause "neither presence turns on which validator rule failed over v", with
  its two named inclusions, is therefore untested. A narrower second gap: on the revise entry point (revisePath("H1"))
  only the presence of the Save control is asserted, never that performing it issues the revise — that
  half is asserted on the new-hypothesis entry only, so a control rendered but inert on the revise entry''s
  refused reading would also survive the set.. The node is decided by reading, and a certification standing
  on it from an earlier reconciliation is released by the bind. The remainder is testable: One input per
  named inclusion against one expected result. Mount the composing surface with GET .../versions/{version}
  refused by CaseVersionNotValidError whose payload names the empty manifest as the failing validator
  rule, and again with one naming v''s own declared subject type as the failing attribute; in each, assert
  the composition''s fields are present and the "Save hypothesis" act is offered and, on click, issues
  the POST — identically to the detail-less refusal. Add the revise entry point (revisePath("H1")) on
  a refused reading as a third input, asserting that clicking the offered act issues the revise-hypothesis
  for H1 rather than only that the control renders..

  Certification of rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
  did not hold: the auditor answered `partial` — Three parts of the fact are unexercised. First, the fact
  states three mutually distinct presentations, and only two of the three ever appear in this set: no
  test in the file renders the surface for a case that currently holds no version at all, so nothing here
  would fail if that state were presented with exactly the same text as "This case''s current version
  does not read back as a case." — the distinctness the fact asserts against the no-version neighbour
  is unasserted in both directions. Second, "states no attribute of v — its title, when_to_use, subject,
  fallback, consolidation_register, state or manifest, nor any fact derived from them" is exercised for
  one attribute only: the cache is seeded with subject and an empty manifest, and only subject is looked
  for, by queryByDisplayValue alone, so a surface that rendered a cached title, fallback, consolidation_register,
  state or a non-empty manifest beside the statement, or rendered the subject as text rather than as a
  field value, would leave every assertion in this set passing. Third, the fact fixes v as the version
  with the highest number among those c currently holds, for a reader who named c by its slug and named
  no version of it; every test here stands on a single VERSION constant and a single case-version query
  key, so nothing exercises a case holding several versions, and the surface judging some version other
  than the highest-numbered one would not fail any test here. Separately, the fact is stated of any surface
  presenting one case named by slug alone, and the pack offers proof for the hypothesis-revision screen
  only; whatever proves it for the other case-keyed surfaces lies outside the offered set and is not mine
  to cite, so the fact is not certified whole.. The node is decided by reading, and a certification standing
  on it from an earlier reconciliation is released by the bind. The remainder is testable: Three assertions
  close it, each one input against one expected result. (1) Mount the surface for a slug whose case currently
  holds no version, and assert the text it renders is neither "This case''s current version does not read
  back as a case." nor "Unable to load this form right now." — pairing the no-version state against each
  of the other two completes the three-way table the fact declares. (2) Seed the case-version query key
  with a version carrying title, when_to_use, subject, fallback, consolidation_register, state and a non-empty
  manifest, refuse that key''s read with CaseVersionNotValidError, and assert each of those values is
  absent by both queryByText and queryByDisplayValue. (3) Mount for a case holding at least two versions
  where the highest-numbered one fails a validator rule and a lower-numbered one reads back cleanly, and
  assert the statement is rendered; then invert it — highest-numbered clean, lower-numbered failing —
  and assert the statement is absent and the form renders, which pins the read to the highest-numbered
  version the case currently holds. Certifying the fact whole additionally needs the same three states
  asserted on each other case-keyed surface, which is a finite set of surfaces the specification names..

  Certification of domain/knowledge/case-summary did not hold: the auditor answered `partial` — The presence
  half of the fact is exercised whole, and the two derivations are genuinely held apart: the second test''s
  case carries a draft at version 3 above released versions 2 and 1, and asserts current_state and last_updated
  off version 3 while asserting title and when_to_use off version 2 — the draft''s own title and when_to_use
  are seeded with values ("Draft title, never read for the summary") that would surface and fail the assertion
  if the three released-derived attributes were read from the most recently authored version instead.
  version_count is exercised at 1 and at 3, and released_version at 1 and at 2, so picking the highest-numbered
  released version rather than the lowest would fail. What goes unexercised is both absence clauses the
  node states. Every case in the set that resolves to a summary at all holds at least one version and
  at least one released version, so nothing exercises a case whose every version was discarded before
  release, where current_state and last_updated are to be absent rather than invented, and nothing exercises
  a case still only in draft and never released, where title, when_to_use and released_version are all
  to be absent rather than read from a draft. The two cases in the set that never reached a released version
  — case-broken and case-bad-one — resolve to the not-valid marker rather than to a summary, so they do
  not stand in for the draft-only summary; their entries assert no summary object at all. The assertions
  are `toEqual` on the whole entry, so they would catch an invented attribute if such a case were in the
  set, but no such case is.. The node is decided by reading, and a certification standing on it from an
  earlier reconciliation is released by the bind. The remainder is testable: Two inputs against two expected
  results, each one reading of the listing. First: a case whose version listing answers a total of 0 with
  no versions, expected to resolve to a summary carrying version_count 0 with current_state and last_updated
  absent from the entry — not null, not a placeholder state — asserted by an equality over the whole entry
  so an invented value fails. Second: a case whose versions are all drafts and none released, expected
  to resolve to a summary carrying version_count, current_state "draft" and last_updated from its highest-numbered
  draft, with title, when_to_use and released_version absent — seeded, as the second existing test already
  does, with a draft title and when_to_use that would surface and fail the assertion if either were read
  from the draft..

  Certified rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone
  as decided by step `test`: src/hooks/use-cases-list-invalid-case-isolation.spec.ts (resolves every other
  case''s own summary unaffected and the failing case''s own entry to only its slug and the not-valid
  marker when one case''s current version fails validation); src/hooks/use-cases-list-invalid-case-isolation.spec.ts
  (resolves the listing successfully with an isolated not-valid entry for each of two cases whose current
  versions fail validation at the same reading, rather than reverting to a whole-listing failure) would
  fail if the fact stopped holding.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) rules/knowledge/a-hypothesis-composition-stands-on-a-reading-whose-anchoring-version-does-not-read-back-as-a-case,
  rules/knowledge/a-hypothesis-composition-states-which-of-its-reads-did-not-complete, rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case,
  rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete,
  rules/knowledge/a-revise-reads-its-drafts-declared-subject-type-even-when-that-draft-does-not-read-back-as-a-case,
  rules/knowledge/a-case-listing-states-a-current-version-that-does-not-read-back-in-that-cases-entry-alone,
  domain/knowledge/case-summary, domain/knowledge/case, rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case,
  rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions,
  rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for, rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
  were read on every file and answered for, and bound from nowhere here — a binding this record writes
  is one the trace already held.

  Candidates: 14 opened across 5 of 22 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 1 fact(s) the source states that no node holds, over 1 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/case-not-valid-surface-presentation-corrective-3.returns/`, which are the evidence behind every entry above.
