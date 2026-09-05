---
contract_version: siegard-reconcile/3
title: hipotese-release-proprio-frontend
summary: 'The 6 tasks of the hipotese-release-proprio-frontend initiative (hypothesis-revision-own-state-ui:
  show-each-revisions-own-state, name-the-not-draft-release-refusal, release-a-revision-from-the-listing;
  case-version-release-gate-ui: show-each-manifest-entrys-pinned-revision-state, name-the-draft-hypotheses-in-the-release-refusal,
  keep-placement-free-of-a-revisions-own-state) wrote and modified these files, exposing the hypothesis-revision''s
  own release lifecycle in the frontend.'
target: frontend
files:
- path: src/hooks/use-hypothesis-revision-release.ts
  change: New hook releasing a hypothesis-revision directly, updating the listing's own cache on success
    and re-reading it on the one named refusal (written by hypothesis-revision-own-state-ui/release-a-revision-from-the-listing).
- path: src/hooks/use-hypothesis-revisions.spec.ts
  change: New spec proving the widened HypothesisRevisionListItem shape carries each revision's own state
    (written by hypothesis-revision-own-state-ui/show-each-revisions-own-state).
- path: src/hooks/use-hypothesis-revisions.ts
  change: Widened HypothesisRevisionListItem with the revision's own draft/released state and exported
    HYPOTHESIS_REVISION_STATE_CELL (written by hypothesis-revision-own-state-ui/show-each-revisions-own-state,
    extended by case-version-release-gate-ui/show-each-manifest-entrys-pinned-revision-state).
- path: src/hooks/use-manifest-pinned-revision-states.ts
  change: New hook resolving each manifest entry's pinned hypothesis-revision's own state from the revisions
    listing (written by case-version-release-gate-ui/show-each-manifest-entrys-pinned-revision-state).
- path: src/hooks/use-manifest-row-revisions.spec.ts
  change: Fixture factory given a default state field so it satisfies the now-required field (modified
    by hypothesis-revision-own-state-ui/show-each-revisions-own-state).
- path: src/routes/case-version-editor-ready-view.tsx
  change: Adds the ManifestTable subcomponent's State column and the release dialog's violations-vs-checklist
    branch (written by case-version-release-gate-ui/show-each-manifest-entrys-pinned-revision-state).
- path: src/routes/case-version-editor-screen-release-checklist.spec.ts
  change: New spec proving the release checklist's concept item over a malformed collects field (written
    by case-version-release-gate-ui/show-each-manifest-entrys-pinned-revision-state).
- path: src/routes/case-version-editor-screen-release-draft-hypothesis-violations.spec.ts
  change: New spec proving the case-version release refusal renders every named draft hypothesis (written
    by case-version-release-gate-ui/name-the-draft-hypotheses-in-the-release-refusal).
- path: src/routes/case-version-editor-screen-view-released-manifest-state.spec.ts
  change: New spec proving the released-view manifest table states each entry's pinned revision state
    (written by case-version-release-gate-ui/show-each-manifest-entrys-pinned-revision-state).
- path: src/routes/hypothesis-revision-history-own-state.spec.ts
  change: New spec proving each row states its own revision's draft/released state, independent of the
    current-pin indication (written by hypothesis-revision-own-state-ui/show-each-revisions-own-state).
- path: src/routes/hypothesis-revision-history-release-action.spec.ts
  change: New spec proving the per-row direct release control (written by hypothesis-revision-own-state-ui/release-a-revision-from-the-listing).
- path: src/routes/hypothesis-revision-history.tsx
  change: Adds the State column and the per-row release control (written by hypothesis-revision-own-state-ui/show-each-revisions-own-state,
    extended by hypothesis-revision-own-state-ui/release-a-revision-from-the-listing).
- path: src/routes/version-manifest-screen-draft-revision-placement.spec.ts
  change: New spec proving manifest placement/repin/removal is unaffected by a revision's own state (written
    by case-version-release-gate-ui/keep-placement-free-of-a-revisions-own-state).
- path: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
  change: New spec proving the manifest builder screen states each entry's pinned revision state (written
    by case-version-release-gate-ui/show-each-manifest-entrys-pinned-revision-state).
- path: src/routes/version-manifest-screen.tsx
  change: Adds the pinned-revision-state badge to RevisionSelect (written by case-version-release-gate-ui/show-each-manifest-entrys-pinned-revision-state).
- path: src/services/error-ui-state.spec.ts
  change: New spec proving HypothesisRevisionNotDraftAtReleaseError resolves to its own exclusive UI-state
    kind (written by hypothesis-revision-own-state-ui/name-the-not-draft-release-refusal).
- path: src/services/error-ui-state.ts
  change: Adds the hypothesis-revision-not-draft-at-release kind and its table entry (written by hypothesis-revision-own-state-ui/name-the-not-draft-release-refusal).
- path: src/services/release-checklist.ts
  change: Hardens conceptsAcceptSubject against a manifest entry with no collects array (modified by case-version-release-gate-ui/show-each-manifest-entrys-pinned-revision-state).
nodes:
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: "src/hooks/use-hypothesis-revision-release.ts: held at the mutation's POST call against the release-hypothesis\
    \ operation — apiFetch<void>(\n  `/v1/cases/${encodeURIComponent(slug)}/hypotheses/${encodeURIComponent(hypothesisName)}/revisions/${revision}/release`,\n\
    \  { method: \"POST\" },\n)\n"
  encoded_at:
  - src/hooks/use-hypothesis-revision-release.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: 'src/hooks/use-hypothesis-revisions.ts: held at the query built in hypothesisRevisionsQueryOptions,
    lines 34-40 — apiFetch<HypothesisRevisionsPage>(`/v1/cases/${encodeURIComponent(slug)}/hypotheses/${encodeURIComponent(hypothesisName)}/revisions`)'
  encoded_at:
  - src/hooks/use-hypothesis-revisions.ts
- node: domain/knowledge/case
  conforms: true
  how: 'src/routes/case-version-editor-ready-view.tsx: held at the slug prop threaded into the manifest
    lookup and the discard confirmation heading — <span>Type {slug} to confirm</span>'
  encoded_at:
  - src/routes/case-version-editor-ready-view.tsx
- node: domain/knowledge/case-version
  conforms: true
  how: 'src/routes/case-version-editor-ready-view.tsx: held at state.manifest and release.version — <DialogTitle>Release
    v{release.version}?</DialogTitle>

    src/routes/version-manifest-screen.tsx: held at the rowsDisabled computation gating every manifest
    control once the version is released — const rowsDisabled = state.isBlocked || state.isBusy || state.isReleased;'
  encoded_at:
  - src/routes/case-version-editor-ready-view.tsx
  - src/routes/version-manifest-screen.tsx
- node: domain/knowledge/hypothesis
  conforms: true
  how: 'src/routes/version-manifest-screen.tsx: held at toStatusRow, keying each row by the hypothesis''s
    own stable name — id: row.hypothesisName,'
  encoded_at:
  - src/routes/version-manifest-screen.tsx
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "src/hooks/use-hypothesis-revision-release.ts: held at the mutation is addressed by slug, hypothesisName\
    \ and revision only — no case-version or manifest identifier — function useHypothesisRevisionRelease(\n\
    \  slug: string,\n  hypothesisName: string,\n  revision: number,\n)\n\nsrc/hooks/use-hypothesis-revisions.ts:\
    \ held at the HypothesisRevisionListItem type, lines 14-20 — export type HypothesisRevisionListItem\
    \ = {\n  readonly revision: number;\n  readonly criterion: string;\n  readonly collects: readonly\
    \ string[];\n  readonly resolution: HypothesisRevisionFormValues[\"resolution\"];\n  readonly state:\
    \ HypothesisRevisionState;\n};\nsrc/routes/hypothesis-revision-history.tsx: held at the row built\
    \ per revision, lines 130-137 — criterion: revision.criterion,\n    collects: revision.collects.join(\"\
    , \"),\n\nsrc/routes/version-manifest-screen.tsx: held at RevisionSelect, reading row.revision and\
    \ each option's own revision/state — const options = optionsWithPinnedRevision(revisions, row.revision);"
  encoded_at:
  - src/hooks/use-hypothesis-revision-release.ts
  - src/hooks/use-hypothesis-revisions.ts
  - src/routes/hypothesis-revision-history.tsx
  - src/routes/version-manifest-screen.tsx
- node: domain/knowledge/hypothesis-revision-state
  conforms: true
  how: "src/hooks/use-hypothesis-revision-release.ts: held at withRevisionReleased, on success, writing\
    \ the released literal onto the matched revision — item.revision === revision ? { ...item, state:\
    \ \"released\" } : item\nsrc/hooks/use-hypothesis-revisions.ts: held at the HypothesisRevisionState\
    \ type alias, line 5 — export type HypothesisRevisionState = \"draft\" | \"released\";\nsrc/routes/hypothesis-revision-history.tsx:\
    \ held at the REVISION_STATE_CELL lookup, lines 38-43 — draft: { color: \"bg-warning\", label: \"\
    Draft\" },\n  released: { color: \"bg-success\", label: \"Released\" },\n"
  encoded_at:
  - src/hooks/use-hypothesis-revision-release.ts
  - src/hooks/use-hypothesis-revisions.ts
  - src/routes/hypothesis-revision-history.tsx
- node: domain/knowledge/manifest-entry
  conforms: true
  how: "src/routes/case-version-editor-ready-view.tsx: held at toManifestRow — position: entry.position,\n\
    \    hypothesis: entry.hypothesis_revision.hypothesis.name,\n\nsrc/routes/version-manifest-screen.tsx:\
    \ held at toStatusRow, pairing a position with a pinned-revision selector per row — position: row.position,\n\
    \    hypothesis: <RevisionSelect slug={slug} row={row} disabled={disabled} />,"
  encoded_at:
  - src/routes/case-version-editor-ready-view.tsx
  - src/routes/version-manifest-screen.tsx
- node: domain/knowledge/resolution
  conforms: true
  how: 'src/hooks/use-hypothesis-revisions.ts: held at the resolution field of HypothesisRevisionListItem,
    line 18 — readonly resolution: HypothesisRevisionFormValues["resolution"];'
  encoded_at:
  - src/hooks/use-hypothesis-revisions.ts
- node: rules/glossary/a-concept-declares-its-description
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the UI_STATE_BY_ERROR_CODE entry for ConceptDescriptionRequiredError,
    line 54 — ConceptDescriptionRequiredError: { kind: "concept-description-required" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the UI_STATE_BY_ERROR_CODE entry for CapabilitySchemaNotWellFormedError,
    line 50 — CapabilitySchemaNotWellFormedError: { kind: "capability-schema-not-well-formed" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/integration/a-capability-is-read-only
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the UI_STATE_BY_ERROR_CODE entry for CapabilityNotReadOnlyError,
    line 49 — CapabilityNotReadOnlyError: { kind: "capability-not-read-only" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the UI_STATE_BY_ERROR_CODE entry for ConnectorConfigurationNotWellFormedError,
    line 52 (the entry covers only the not-well-formed code the node names; IncompleteConnectorConfigurationError
    has no entry and falls to GENERIC_ERROR_STATE by the ?? fallback) — ConnectorConfigurationNotWellFormedError:
    { kind: "connector-configuration-not-well-formed" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/integration/one-capability-answers-one-concept
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the UI_STATE_BY_ERROR_CODE entry for ConceptAlreadyAnsweredError,
    line 43 — ConceptAlreadyAnsweredError: { kind: "concept-already-answered" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  conforms: false
  how: "src/services/release-checklist.ts, buildReleaseChecklist, the returned checklist item 'Manifest\
    \ holds at least one hypothesis': {\n      label: `Manifest holds at least one hypothesis (${manifestEntries.length})`,\n\
    \      satisfied: manifestEntries.length > 0,\n    },\n — The invariant that a case version's manifest\
    \ must hold at least one entry is expressed a second time here, independently of the node that states\
    \ it. A curator reads this checklist rather than the specification to learn the condition, and if\
    \ the invariant is ever restated differently at rules/knowledge/a-case-has-at-least-one-hypothesis,\
    \ nothing ties this literal re-derivation back to it for either side to notice the drift."
  observed_at:
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: 'src/routes/case-version-editor-ready-view.tsx: held at RELEASE_DIALOG_DESCRIPTION, rendered inside
    the release dialog — "Once released, this version and every manifest entry it holds are frozen — permanently."

    src/routes/version-manifest-screen.tsx: held at the same rowsDisabled gate applied to move/remove/repin
    once state.isReleased — const rowsDisabled = state.isBlocked || state.isBusy || state.isReleased;'
  encoded_at:
  - src/routes/case-version-editor-ready-view.tsx
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version
  conforms: true
  how: 'src/routes/hypothesis-revision-history.tsx: held at the usesNoRevision flag and its message, lines
    160 and 172-174 — const usesNoRevision = currentPin.phase === "ready" && currentPin.pinnedRevision
    === null;'
  encoded_at:
  - src/routes/hypothesis-revision-history.tsx
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-release.ts: held at the onError branch distinguishing the not-draft-at-release
    refusal — if (errorStateKind(error) === "hypothesis-revision-not-draft-at-release") {

    src/services/error-ui-state.ts: held at the UI_STATE_BY_ERROR_CODE entry for HypothesisRevisionNotDraftAtReleaseError,
    line 41, and the UiErrorState shape itself, which carries no field beyond kind — HypothesisRevisionNotDraftAtReleaseError:
    { kind: "hypothesis-revision-not-draft-at-release" },'
  encoded_at:
  - src/hooks/use-hypothesis-revision-release.ts
  - src/services/error-ui-state.ts
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  conforms: true
  how: 'src/routes/hypothesis-revision-history.tsx: held at the row identity, line 130 — id: revision.revision,'
  encoded_at:
  - src/routes/hypothesis-revision-history.tsx
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  conforms: false
  how: "src/routes/hypothesis-revision-history.tsx, the rows construction, lines 124-126: .slice()\n \
    \ .sort((a, b) => b.revision - a.revision)\n — The descending-by-revision-number order that rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first\
    \ assigns to the listing itself is re-derived here as a second, independent sort over whatever page\
    \ the hook returns. A reader auditing how the order is guaranteed finds it enforced twice — once as\
    \ the API's own invariant, once as this local .sort — and the two can diverge silently: a change to\
    \ (or a bug in) the listing's own ordering would be masked here rather than surfaced, since this component\
    \ fixes the order itself regardless of what it received."
  observed_at:
  - src/routes/hypothesis-revision-history.tsx
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  conforms: true
  how: 'src/routes/hypothesis-revision-history.tsx: held at the state cell, line 132 — state: REVISION_STATE_CELL[revision.state],'
  encoded_at:
  - src/routes/hypothesis-revision-history.tsx
- node: rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
  conforms: true
  how: "src/routes/version-manifest-screen.tsx: held at optionsWithPinnedRevision, appending the pinned\
    \ revision to the option list when the fetched page omits it — if (options.some((option) => option.value\
    \ === pinnedValue)) {\n    return options;\n  }\n\n  return [...options, { value: pinnedValue, label:\
    \ pinnedValue }];"
  encoded_at:
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state
  conforms: false
  how: "src/hooks/use-manifest-pinned-revision-states.ts, the manifest.forEach block that computes each\
    \ entry's state, lines 21-29: const pinned = result.data?.data.find(\n  (item) => item.revision ===\
    \ entry.hypothesis_revision.revision,\n);\nif (pinned !== undefined) {\n  states.set(entry.position,\
    \ pinned.state);\n} — hypothesisRevisionsQueryOptions is called with no offset or limit, so result.data.data\
    \ is only the default first page of that hypothesis's revisions (constraints/listings-are-paged).\
    \ When an entry's pinned revision is an older one that does not fall on that default page, .find returns\
    \ undefined, states.set is never called for that entry's position, and the map this hook returns carries\
    \ no state for it at all — exactly the silent, page-dependent gap the rule calls out as never permitted\
    \ (\"the statement is unconditional ... it does not depend on ... the reader opening e's revision\
    \ selector\"). Whatever surface consumes this map is left unable to distinguish \"still draft\" from\
    \ \"not yet known,\" for a pin the curator has already placed.\nsrc/routes/case-version-editor-screen-view-released-manifest-state.spec.ts,\
    \ describe block \"the released manifest table's state cell when the pin is absent from the answered\
    \ page (this task's own inference)\", lines 102-125: expect(within(row).getByText(\"Delayed payment\
    \ history\")).toBeTruthy();\nexpect(within(row).getByText(\"4\")).toBeTruthy();\nexpect(within(row).queryByText(\"\
    Draft\")).toBeNull();\nexpect(within(row).queryByText(\"Released\")).toBeNull();\n — For a manifest\
    \ entry whose hypothesis's revisions listing answered but did not carry the pinned revision on the\
    \ page fetched (here revision 9 answered where the entry pins revision 4), the screen renders the\
    \ entry's other facts but shows neither \"Draft\" nor \"Released\" at all. The pinned-revision-state\
    \ rule states the disclosure is unconditional — it names only three things it does not depend on (the\
    \ case version's own state, a release having been attempted, or the reader opening the revision selector)\
    \ — and does not except a page that failed to carry the pinned revision from that guarantee. A curator\
    \ looking at this entry loses exactly the fact — is this pin still in draft? — the specification says\
    \ must never be recoverable only from a failed release; here it is recoverable from nowhere at all,\
    \ silently. The test's own title names this \"this task's own inference,\" which is the source deciding\
    \ a business behavior the specification does not state and, on this point, actively contradicts.\n\
    src/routes/version-manifest-screen.tsx, RevisionSelect, lines 169 and 192-203: const pinnedRevisionState\
    \ = revisions.find((item) => item.revision === row.revision)?.state;\n...\n{pinnedRevisionState !==\
    \ undefined && (\n          <span className=\"inline-flex shrink-0 items-center gap-1 text-sm\"> —\
    \ revisions is the raw, possibly-paged answer for that hypothesis (fetched with no offset/limit, so\
    \ a default page a curator has not paged past); optionsWithPinnedRevision already compensates for\
    \ this same truncation when showing the revision number, but pinnedRevisionState does not — when the\
    \ pinned revision falls off that page, pinnedRevisionState is undefined and the whole draft/released\
    \ badge is skipped. A curator composing the manifest then sees an entry with no state indicator at\
    \ all, and only discovers the pin is still draft when a later release is refused — exactly the silence\
    \ the rule states the disclosure exists to prevent."
  observed_at:
  - src/hooks/use-hypothesis-revisions.ts
  - src/hooks/use-manifest-pinned-revision-states.ts
  - src/routes/case-version-editor-ready-view.tsx
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/a-release-refusal-with-no-named-violation-says-so
  conforms: true
  how: "src/routes/case-version-editor-ready-view.tsx: held at the release dialog's violations branch\
    \ — <p className=\"text-sm text-destructive\">\n                  No specific violation was returned.\n\
    \                </p>\n"
  encoded_at:
  - src/routes/case-version-editor-ready-view.tsx
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  conforms: true
  how: "src/routes/case-version-editor-ready-view.tsx: held at the release dialog's violations list —\
    \ {release.dialog.violations.map((violation) => (\n                    <li key={violation}>! {violation}</li>\n\
    \                  ))}\n\nsrc/routes/version-manifest-screen.tsx: held at repinIfChanged, which repins\
    \ to any chosen revision without reading that revision's own state — function repinIfChanged(value:\
    \ string): void {\n    const chosenRevision = Number(value);\n    if (chosenRevision !== row.revision)\
    \ {\n      row.onRepin(chosenRevision);\n    }\n  }\nsrc/services/release-checklist.ts: held at extractReleaseViolations\
    \ — const { violations } = details;\nreturn Array.isArray(violations)\n  ? violations.filter((item):\
    \ item is string => typeof item === \"string\")\n  : [];\n"
  encoded_at:
  - src/routes/case-version-editor-ready-view.tsx
  - src/routes/version-manifest-screen.tsx
  - src/services/release-checklist.ts
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: 'src/routes/version-manifest-screen.tsx: held at MANIFEST_COLUMNS'' position column and toStatusRow''s
    position mapping, both taken from the row''s own declared position — { key: "position", header: "#"
    },'
  encoded_at:
  - src/routes/version-manifest-screen.tsx
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the distinct kind assigned to ConceptDescriptionRequiredError,
    line 54, rather than folding it into GENERIC_ERROR_STATE — ConceptDescriptionRequiredError: { kind:
    "concept-description-required" },'
  encoded_at:
  - src/services/error-ui-state.ts
- node: scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  conforms: true
  how: "src/hooks/use-hypothesis-revision-release.ts: held at the hook's own parameters and endpoint,\
    \ which reference only the hypothesis and its revision, never a case version or a manifest position\
    \ — function useHypothesisRevisionRelease(\n  slug: string,\n  hypothesisName: string,\n  revision:\
    \ number,\n)\n\nsrc/routes/hypothesis-revision-history.tsx: held at the release-action gate, line\
    \ 148 — {revision.state === \"draft\" && ("
  encoded_at:
  - src/hooks/use-hypothesis-revision-release.ts
  - src/routes/hypothesis-revision-history.tsx
- node: scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
  conforms: true
  how: 'src/routes/case-version-editor-ready-view.tsx: held at the same violations list, wrapped in role="alert"
    — <div role="alert">'
  encoded_at:
  - src/routes/case-version-editor-ready-view.tsx
- node: scenarios/knowledge/placing-a-manifest-entry-is-never-refused-for-a-drafts-revision-state
  conforms: true
  how: "src/routes/version-manifest-screen.tsx: held at repinIfChanged, which never inspects the chosen\
    \ revision's state before repinning — if (chosenRevision !== row.revision) {\n      row.onRepin(chosenRevision);\n\
    \    }"
  encoded_at:
  - src/routes/version-manifest-screen.tsx
- node: scenarios/knowledge/releasing-an-already-released-revision-tells-the-curator-so
  conforms: true
  how: 'src/services/error-ui-state.ts: held at the distinct kind assigned to HypothesisRevisionNotDraftAtReleaseError,
    line 41, rather than folding it into GENERIC_ERROR_STATE — HypothesisRevisionNotDraftAtReleaseError:
    { kind: "hypothesis-revision-not-draft-at-release" },'
  encoded_at:
  - src/services/error-ui-state.ts
unstated:
- file: src/routes/version-manifest-screen-pinned-revision-state.spec.ts
  where: lines 117-136, describe/it block "the state statement when the pin is absent from the answered
    page (this task's own inference)"
  evidence: 'expect(within(findRow("H1")).queryByText("Draft")).toBeNull();

    expect(within(findRow("H1")).queryByText("Released")).toBeNull();

    '
  cost: The test fixes, as the correct behavior a suite will keep green, that a manifest entry shows no
    draft-or-released statement at all whenever the pinned hypothesis-revision is not on the page the
    revisions listing happened to answer — even though the entry's own pinned revision number (2) is still
    shown (line 132). The test's own title admits this is "this task's own inference," so a future reader
    who checks the specification for what an entry says when its pin falls outside the fetched page finds
    nothing there, while the source and its suite already answer it — the same silence rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
    closed for the pinned revision's own reference is left open here for the revision's state.
unbound:
- src/hooks/use-hypothesis-revisions.spec.ts
- src/hooks/use-manifest-row-revisions.spec.ts
- src/routes/case-version-editor-screen-release-checklist.spec.ts
- src/routes/case-version-editor-screen-release-draft-hypothesis-violations.spec.ts
- src/routes/case-version-editor-screen-view-released-manifest-state.spec.ts
- src/routes/hypothesis-revision-history-own-state.spec.ts
- src/routes/hypothesis-revision-history-release-action.spec.ts
- src/routes/version-manifest-screen-draft-revision-placement.spec.ts
- src/routes/version-manifest-screen-pinned-revision-state.spec.ts
- src/services/error-ui-state.spec.ts
notes: "Judged by 18 delegation(s), one per file; folded mechanically by trace.py --fold from the returns\
  \ under siegard-reconcile/hipotese-release-proprio-frontend.returns/.\nStaged by a review over files\
  \ a delivery wrote: no pair was omitted, so the delivery's own claims and every other binding of these\
  \ files were judged alike; the plan's node(s) constraints/listings-are-paged, constraints/no-route-enforces-authentication,\
  \ contracts/knowledge/case-lifecycle, domain/knowledge/hypothesis-revision, domain/knowledge/hypothesis-revision-state,\
  \ rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle, rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first,\
  \ rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state, rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state,\
  \ rules/knowledge/a-release-refusal-with-no-named-violation-says-so, rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions,\
  \ scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest, scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions,\
  \ scenarios/knowledge/placing-a-manifest-entry-is-never-refused-for-a-drafts-revision-state, scenarios/knowledge/releasing-an-already-released-revision-tells-the-curator-so\
  \ were read on every file and answered for, and bound from nowhere here — a binding this record writes\
  \ is one the trace already held.\nA finding in src/services/release-checklist.ts names rules/knowledge/every-position-declares-a-resolution,\
  \ which no file of this set is bound to: buildReleaseChecklist, the fallbackTermsExist computation and\
  \ the 'Fallback resolution is set' checklist item: const fallbackTermsExist =\n    outcomeOptions.options.some((option)\
  \ => option.value === record.fallback.outcome) &&\n    actionOptions.options.some((option) => option.value\
  \ === record.fallback.referral.action) &&\n    recipientOptions.options.some(\n      (option) => option.value\
  \ === record.fallback.referral.recipient,\n    );\n — \"Every hypothesis-revision and every case version's\
  \ fallback declare an outcome and a referral\" is a fact rules/knowledge/every-position-declares-a-resolution\
  \ already states. This file re-derives it as a client-side membership check against currently loaded\
  \ vocabulary options; a reader who wants to know what the fallback is required to declare finds it stated\
  \ twice, one of them not the node.. It blocks nothing here; it is owed a route of its own.\nA finding\
  \ in src/services/release-checklist.ts names rules/knowledge/a-concept-accepts-the-declared-subject-type,\
  \ which no file of this set is bound to: buildReleaseChecklist, the conceptsAcceptSubject computation\
  \ and the 'Every collected concept accepts the case subject' checklist item: return collects.every((conceptName)\
  \ => {\n      const concept = concepts.find((candidate) => candidate.name === conceptName);\n      return\
  \ concept !== undefined && concept.accepts.includes(record.subject);\n    });\n — rules/knowledge/a-concept-accepts-the-declared-subject-type\
  \ already states that every concept a case version's manifested hypothesis-revisions collect must accept\
  \ the case version's declared subject type, refused server-side with ConceptRefusesSubjectTypeError.\
  \ This file re-derives the same predicate (concept.accepts includes the subject) as a client-side preview;\
  \ if the rule's condition ever changes, this second expression of it has no link back to the node to\
  \ keep it aligned.. It blocks nothing here; it is owed a route of its own.\nCandidates: 8 opened across\
  \ 5 of 18 delegation(s); each return lists its own under `candidates_opened`.\nUnstated: 1 fact(s) the\
  \ source states that no node holds, over 1 file(s), listed under `unstated`. They block no binding here\
  \ and no rebind closes them — the route is the analysis that gives each fact a node."
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/hipotese-release-proprio-frontend.returns/`, which are the evidence behind every entry above.
