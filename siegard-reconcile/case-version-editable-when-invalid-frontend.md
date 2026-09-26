---
contract_version: siegard-reconcile/5
title: case-version-editable-when-invalid -- frontend
summary: Frontend tasks routing the simulation and manifest screens to the version editor, loading and
  presenting a refused draft's own record on the editor, saving a correction and offering discard on that
  reading.
target: frontend
files:
- path: src/hooks/use-edit-draft-version-form-not-valid-actions.spec.ts
  change: test written to prove load-a-refused-drafts-own-record-into-the-editor-state
- path: src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts
  change: test written to prove load-a-refused-drafts-own-record-into-the-editor-state
- path: src/hooks/use-edit-draft-version-form-not-valid-marking.spec.ts
  change: test written to prove load-a-refused-drafts-own-record-into-the-editor-state
- path: src/hooks/use-edit-draft-version-form.ts
  change: 'added readonly discard?: DiscardControlState to the "not-valid" phase''s EditDraftVersionFormState
    union member; hoisted the discardMutation declaration (built once via buildDiscardMutationOptions,
    shared by both phases) above the useNotValidDraftVersionState call, and threaded the discard dialog-open/slugConfirmation/errorMessage
    state tuples, discardMutation.isPending and its confirm callback into that call as new arguments'
- path: src/hooks/use-not-valid-draft-version-state.ts
  change: 'added five new parameters (discardDialogOpen, discardSlugConfirmation, discardErrorMessage,
    isDiscardConfirming, onDiscardConfirm) carrying the raw ingredients buildDiscardControlState needs;
    on the enriched "not-valid" return, added a discard field built via buildDiscardControlState with
    canDiscard: notValidVersionState === "draft", left undefined otherwise'
- path: src/routes/case-simulation-header.tsx
  change: on a released versionState, renders a second Button/Link pair before the existing "Edit version"
    (new-draft) control -- a Link to /cases/$slug/versions/$version (this same released version's own
    editor) labelled "View this version" -- wrapped together with the existing button so both render side
    by side; the draft branch is unchanged
- path: src/routes/case-simulation-screen.spec.ts
  change: test written to prove route-the-simulation-screen-to-the-version-editor
- path: src/routes/case-simulation-screen.tsx
  change: imports CaseVersionEditorLink and renders it (with the screen's own string version param and
    slug) inside both the "loading" phase's <p> and the "load-error" phase's <section>, alongside the
    existing Retry button; the "ready" phase is unchanged
- path: src/routes/case-version-editor-link.tsx
  change: new small route-link component, CaseVersionEditorLink, taking slug and version and rendering
    a TanStack Router Link to /cases/$slug/versions/$version (the case version editor's own route); extracted
    to its own file since inlining would have pushed version-manifest-screen.tsx over MNT-01's 300-line
    budget
- path: src/routes/case-version-editor-not-valid-view.tsx
  change: 'added a slug prop; added readonly discard?: DiscardControlState to EnrichedNotValidState; rendered
    DiscardDraftDialog inside the button footer, gated on state.discard !== undefined && state.discard.canDiscard'
- path: src/routes/case-version-editor-ready-view.tsx
  change: replaced the inline discard Dialog block with DiscardDraftDialog; removed the now-unused Label/Input
    imports and the DISCARD_DIALOG_DESCRIPTION constant (moved into the shared component). Behavior unchanged
- path: src/routes/case-version-editor-screen-refused-draft-discard.spec.ts
  change: test written to prove offer-discard-on-the-refused-reading
- path: src/routes/case-version-editor-screen-refused-draft-save.spec.ts
  change: test written to prove save-a-correction-on-the-refused-reading
- path: src/routes/case-version-editor-screen-refused-draft.spec.ts
  change: test written to prove present-the-refused-draft-on-the-editor-screen
- path: src/routes/case-version-editor-screen.tsx
  change: passed slug through to CaseVersionEditorNotValidView
- path: src/routes/discard-draft-dialog.tsx
  change: new shared DiscardDraftDialog component (discard confirmation dialog with slug-typed confirmation,
    error text and destructive confirm button), extracted from case-version-editor-ready-view.tsx's inline
    JSX so the identical structure/wording can be reused by both the ready and not-valid views
- path: src/routes/version-manifest-screen-editor-link.spec.ts
  change: test written to prove route-the-manifest-screen-to-the-version-editor
- path: src/routes/version-manifest-screen.tsx
  change: imports CaseVersionEditorLink and renders it, keyed to the screen's own slug/version params,
    in all four phases (loading, load-error, not-valid, ready) with its presence in the ready phase unconditional,
    not gated by state.isReleased; also compacted the load-error phase's pre-existing three-line Retry
    button to one line to stay within the line budget
nodes:
- node: constraints/a-successful-case-version-own-record-read-answers-with-http-200
  conforms: true
  how: "src/hooks/use-not-valid-draft-version-state.ts: held at nowhere — the file consumes the fetch's\
    \ success/error branches but never itself states or enforces an HTTP status; that lives in the service\
    \ layer this file calls into. — apiFetch<CaseVersionRecord>(\n        `/v1/cases/${encodeURIComponent(slug)}/versions/${version}/declared-attributes`,\n\
    \      )"
  encoded_at:
  - src/hooks/use-not-valid-draft-version-state.ts
- node: contracts/glossary/glossary-query
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at The three vocabulary reads that initialize outcomeOptions,
    actionOptions and recipientOptions, line 124. — const outcomeOptions = useGlossaryVocabularyOptions("outcome");
    const actionOptions = useGlossaryVocabularyOptions("action"); const recipientOptions = useGlossaryVocabularyOptions("recipient");'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: contracts/investigation/case-simulation
  conforms: true
  how: "src/routes/case-simulation-header.tsx: held at the Simulate button, which the file leaves unconditioned\
    \ on draft or released state — matching the contract's \"open to a case version in either state\"\
    \ — <Button type=\"button\" disabled={!canSimulate} onClick={onSimulateCase}>\n      ▶ Simulate case\n\
    \    </Button>\nsrc/routes/case-version-editor-screen.tsx: held at the \"Simulate\" route offered\
    \ only on the ready-phase branch, line 69-71 — <Link to=\"/cases/$slug/versions/$version/simulate\"\
    \ params={{ slug, version }}>\n  Simulate\n</Link>"
  encoded_at:
  - src/routes/case-simulation-header.tsx
  - src/routes/case-version-editor-screen.tsx
- node: contracts/knowledge/case-lifecycle
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-edit-draft-version-form.ts, and
    src/routes/case-simulation-header.tsx read `nowhere` — the file''s whole button list only issues navigation
    (`<Link>` targets) and a `onSimulateCase` callback; no `update-draft`, `release`, `discard`, `place-hypothesis`
    or other case-lifecycle operation is invoked from this file — a binding asserts the file answers for
    the node, so the pair that stopped holding it is released by `--bind ... --replace`, never restamped
    here'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-simulation-header.tsx
- node: contracts/knowledge/case-query
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at versionQuery's queryFn, line 119. — queryFn:\
    \ () => apiFetch<CaseVersionRecord>(`/v1/cases/${encodeURIComponent(slug)}/versions/${version}`),\n\
    src/hooks/use-not-valid-draft-version-state.ts: held at the declaredAttributesQuery definition, lines\
    \ 46-53 — queryFn: () =>\n      apiFetch<CaseVersionRecord>(\n        `/v1/cases/${encodeURIComponent(slug)}/versions/${version}/declared-attributes`,\n\
    \      ),"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-not-valid-draft-version-state.ts
- node: domain/glossary/action
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at actionOptions, fetched line 124 and returned
    on the ready phase, line 321. — const actionOptions = useGlossaryVocabularyOptions("action"); ...
    actionOptions,'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: domain/glossary/concept
  conforms: false
  how: 'no named file holds this fact now: src/hooks/use-edit-draft-version-form.ts read `nowhere` — The
    file names no concept anywhere; its vocabulary reads are limited to useGlossaryVocabularyOptions("outcome"),
    ("action") and ("recipient") (line 124).'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: domain/glossary/outcome
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at outcomeOptions, fetched line 124 and returned
    on the ready phase, line 320. — const outcomeOptions = useGlossaryVocabularyOptions("outcome");'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: domain/glossary/recipient
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at recipientOptions, fetched line 124 and returned
    on the ready phase, line 322. — const recipientOptions = useGlossaryVocabularyOptions("recipient");'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: domain/glossary/subject-type
  conforms: false
  how: 'no named file holds this fact now: src/hooks/use-edit-draft-version-form.ts read `nowhere` — resetFormFrom
    writes `subject: record.subject` into the form, but the file fetches no subject-type vocabulary —
    only useGlossaryVocabularyOptions("outcome"), ("action") and ("recipient") are read (line 124).'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: domain/knowledge/case
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at The `slug` parameter, used as the case''s own
    identity across every call. — apiFetch<CaseVersionRecord>(`/v1/cases/${encodeURIComponent(slug)}/versions/${version}`)

    src/routes/case-version-editor-ready-view.tsx: held at the `slug` prop threaded through the manifest
    read and the discard dialog — <ManifestTable slug={slug} manifest={state.manifest ?? []} /> ... <DiscardDraftDialog
    discard={discard} slug={slug} disabled={state.isBlocked} />'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-version-editor-ready-view.tsx
- node: domain/knowledge/case-version
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at The `record` read from versionQuery.data and\
    \ the fields resetFormFrom writes onto the form. — const record = versionQuery.data; ... form.reset({\
    \ title: record.title, when_to_use: record.when_to_use, subject: record.subject, fallback: record.fallback,\
    \ consolidation_register: record.consolidation_register, });\nsrc/hooks/use-not-valid-draft-version-state.ts:\
    \ held at the effect that resets the form from the fetched record, lines 55-60 — if (declaredAttributesQuery.data)\
    \ {\n      resetFormFrom(form, declaredAttributesQuery.data);\n      setStatus(\"clean\");\n    }\n\
    src/routes/case-simulation-header.tsx: held at the header's display of the version's slug, number\
    \ and when_to_use attributes — {slug} · v{version}\n...\n<p className=\"text-sm text-muted-foreground\"\
    >&quot;{whenToUse}&quot;</p>\nsrc/routes/case-version-editor-ready-view.tsx: held at the release dialog's\
    \ title, which carries the version number — <DialogTitle>Release v{release.version}?</DialogTitle>\n\
    src/routes/version-manifest-screen.tsx: held at the guards derived from the version's own state and\
    \ manifest, e.g. `const rowsDisabled = state.isBlocked || state.isBusy || state.isReleased;` and `{!state.isReleased\
    \ && placingControl}` — const rowsDisabled = state.isBlocked || state.isBusy || state.isReleased;"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-not-valid-draft-version-state.ts
  - src/routes/case-simulation-header.tsx
  - src/routes/case-version-editor-ready-view.tsx
  - src/routes/version-manifest-screen.tsx
- node: domain/knowledge/case-version-state
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at The `record.state` comparisons for canRelease,\
    \ isReadOnly, isBlocked and canDiscard. — const canRelease = record.state === \"draft\" && !isReleased;\
    \ ... isReadOnly: record.state === \"released\",\nsrc/routes/case-simulation-header.tsx: held at the\
    \ VERSION_STATE_CELL lookup and the draft/released branch — const VERSION_STATE_CELL: Record<CaseVersionState,\
    \ { color: string; label: string }> = {\n  draft: { color: \"bg-warning\", label: \"Draft\" },\n \
    \ released: { color: \"bg-success\", label: \"Released\" },\n};"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-simulation-header.tsx
- node: domain/knowledge/hypothesis
  conforms: true
  how: 'src/routes/version-manifest-screen.tsx: held at row.hypothesisName, read from a ManifestRow and
    used to label the row''s controls — aria-label={`Move ${row.hypothesisName} up`}'
  encoded_at:
  - src/routes/version-manifest-screen.tsx
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: 'src/routes/version-manifest-screen.tsx: held at row.revision and the pinned state read alongside
    it in RevisionSelect — const pinnedState = usePinnedRevisionState(slug, row.hypothesisName, row.revision);'
  encoded_at:
  - src/routes/version-manifest-screen.tsx
- node: domain/knowledge/manifest-entry
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at record.manifest, read into useManifestPinnedRevisionStates\
    \ and exposed on the ready phase. — const manifestPinnedStates = useManifestPinnedRevisionStates(slug,\
    \ versionQuery.data?.manifest ?? []); ... manifest: record.manifest,\nsrc/routes/case-version-editor-ready-view.tsx:\
    \ held at `toManifestRow`, which maps one manifest entry to its position, its pinned hypothesis and\
    \ revision — function toManifestRow(\n  entry: CaseVersionManifestEntry,\n  pinnedStates: ManifestPinnedRevisionStates,\n\
    ): StatusTableRow {\n  const pinnedState = pinnedStates.get(entry.position) ?? STILL_UNRESOLVED_PIN_STATE;\n\
    \  return {\n    id: entry.position,\n    position: entry.position,\n    hypothesis: entry.hypothesis_revision.hypothesis.name,\n\
    \    revision: entry.hypothesis_revision.revision,\n    state: pinnedRevisionStateCell(pinnedState),\n\
    \    criterion: entry.hypothesis_revision.criterion,\n  };\n}\nsrc/routes/version-manifest-screen.tsx:\
    \ held at the position and referenced-revision fields carried on each ManifestRow into the table row\
    \ — position: row.position,"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-version-editor-ready-view.tsx
  - src/routes/version-manifest-screen.tsx
- node: domain/knowledge/referral
  conforms: false
  how: 'no named file holds this fact now: src/hooks/use-edit-draft-version-form.ts read `nowhere` — The
    file passes `fallback: record.fallback,` wholesale and returns actionOptions and recipientOptions
    for editing it, without itself reading a referral''s action or recipient.'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: domain/knowledge/resolution
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at record.fallback reset onto the form, paired
    with outcomeOptions. — fallback: record.fallback, ... outcomeOptions,'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  conforms: false
  how: 'the fact left part of its ground: still held in src/routes/version-manifest-screen.tsx, and src/hooks/use-edit-draft-version-form.ts
    read `nowhere` — The file never inspects manifest length; it only computes `versionQuery.isError &&
    versionErrorKind === "case-not-valid"` (line 202) and forwards it to useNotValidDraftVersionState,
    where a manifest-empty reading is actually handled. — a binding asserts the file answers for the node,
    so the pair that stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at The `case-not-valid` flag computed for useNotValidDraftVersionState,
    line 202. — versionQuery.isError && versionErrorKind === "case-not-valid",'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: false
  how: 'src/routes/case-version-editor-ready-view.tsx, the RELEASE_DIALOG_DESCRIPTION constant, rendered
    as the release confirmation dialog''s own DialogDescription: "Once released, this version and every
    manifest entry it holds are frozen — permanently." — the confirmation dialog re-asserts the write-once
    invariant''s own content as its own authority; if a-case-version-is-written-once is ever revised (an
    exception carved into it, say), this hardcoded sentence keeps telling every curator confirming a release
    the old rule, and nothing ties the string back to the node for whoever changes it to find.'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-version-editor-ready-view.tsx
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at patchMutation''s and releaseMutation''s onError
    branches for "case-version-not-draft" and "case-version-not-draft-at-release". — if (kind === "case-version-not-draft")
    { setStatus("conflict"); ... if (kind === "case-version-not-draft-at-release") {'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: false
  how: 'no named file holds this fact now: src/hooks/use-edit-draft-version-form.ts read `nowhere` — The
    file never reads or checks a concept''s accepted subject types, and has no reference to concept at
    all.'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/a-discard-is-offered-and-accepted-while-its-drafts-current-read-does-not-answer-a-case
  conforms: false
  how: 'src/routes/case-version-editor-screen-refused-draft-discard.spec.ts, the comment above notValidDraftHandlers,
    lines 43-46: the versions listing reports this same version''s own state (the gate the discard offer
    turns on) — the discard-offer''s own condition — that it turns on the version''s state alone, per
    only-a-draft-case-version-may-be-discarded — is restated here in prose next to the fixture rather
    than left to the node; if the node''s condition ever changes, this comment can go on saying what it
    used to say, and a reader who trusts the comment instead of opening the node never notices the two
    have parted ways.'
  observed_at:
  - src/hooks/use-not-valid-draft-version-state.ts
  - src/routes/case-version-editor-not-valid-view.tsx
  - src/routes/discard-draft-dialog.tsx
- node: rules/knowledge/a-draft-case-versions-discard-reproduces-the-cases-own-slug
  conforms: true
  how: "src/routes/discard-draft-dialog.tsx: held at the confirmation `Label`/`Input` pair, which asks\
    \ the curator to type the case's own slug before the confirm button is enabled. — <span>Type {slug}\
    \ to confirm</span>\n...\n<Input\n  value={discard.slugConfirmation}\n  onChange={(event) => discard.onSlugConfirmationChange(event.target.value)}\n"
  encoded_at:
  - src/routes/discard-draft-dialog.tsx
  decided_by: reading
  remainder: testable
  remainder_why: On the editor's ordinary draft reading, confirm the discard with a value other than the
    case's slug and expect no DELETE, then with the exact slug and expect exactly one DELETE. On either
    reading, confirm with a strict prefix of the slug (the slug minus its last character) and with a case-varied
    slug, and expect no DELETE for either.
- node: rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at The effect that resets the form only once versionQuery.data\
    \ has arrived, and the \"loading\" phase returned until then. — useEffect(() => { if (versionQuery.data)\
    \ { resetFormFrom(form, versionQuery.data); setStatus(\"clean\"); } }, [versionQuery.data]); ... if\
    \ (versionQuery.isLoading || isLoadingGlossary || !versionQuery.data) { return { phase: \"loading\"\
    \ }; }\nsrc/hooks/use-not-valid-draft-version-state.ts: held at the same effect, lines 55-60 — if\
    \ (declaredAttributesQuery.data) {\n      resetFormFrom(form, declaredAttributesQuery.data);\n   \
    \   setStatus(\"clean\");\n    }"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-not-valid-draft-version-state.ts
- node: rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
  conforms: true
  how: "src/routes/version-manifest-screen.tsx: held at optionsWithPinnedRevision, which adds the pinned\
    \ revision to the select's options when the answered page omits it — if (options.some((option) =>\
    \ option.value === pinnedValue)) {\n  return options;\n} return [...options, { value: pinnedValue,\
    \ label: pinnedValue }];"
  encoded_at:
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for
  conforms: false
  how: "src/routes/version-manifest-screen.tsx, the ConflictBanner rendered in the loaded branch of VersionManifestScreen,\
    \ lines 307-312: {state.isBlocked && (\n  <ConflictBanner\n    title=\"This version was released by\
    \ someone else\"\n    message=\"Your changes were not saved. Reload to see the current state, or start\
    \ a new draft.\"\n  />\n)} — The node holds a presentation of its own for exactly two composing refusals\
    \ (ManifestPositionOccupiedError, ManifestWouldHoldNoHypothesisError) and requires every other refusal\
    \ either composing act carries to be shown as \"the notice that surface shows for a request that failed\
    \ for a reason it does not recognise, disclosing nothing further about it.\" A manifest-composing\
    \ call refused because the version moved out of draft answers with CaseVersionNotDraftError (rules/knowledge/a-case-version-moves-through-its-declared-lifecycle),\
    \ which is neither of the two named codes, so it falls in the \"every other refusal\" bucket. This\
    \ banner instead names the specific cause (\"released by someone else\") and prescribes a specific\
    \ remedy (\"start a new draft\"), disclosing exactly what the node forbids disclosing for an unnamed\
    \ refusal. The next reader who wants to know where this specific wording and this specific diagnosis\
    \ were decided will not find them in the specification — they were decided here, in this component,\
    \ as a third presentation the node does not authorize."
  observed_at:
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
  conforms: true
  how: 'src/routes/version-manifest-screen.tsx: held at placingControl is included in the loading, load-error
    and not-valid branches unconditionally, and in the loaded branch guarded only by `!state.isReleased`
    — {!state.isReleased && placingControl}'
  encoded_at:
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives
  conforms: true
  how: "src/hooks/use-not-valid-draft-version-state.ts: held at the two loading-phase returns, lines 74-76\
    \ and 91-93 — if (!versionsQuery.data) {\n    return { phase: \"loading\" };\n  }\n...\nif (declaredAttributesQuery.isLoading\
    \ || isLoadingGlossary || !declaredAttributesQuery.data) {\n    return { phase: \"loading\" };\n \
    \ }"
  encoded_at:
  - src/hooks/use-not-valid-draft-version-state.ts
- node: rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading
  conforms: true
  how: "src/routes/case-simulation-header.tsx: held at both branches of the draft/released ternary route\
    \ to `/cases/$slug/versions/$version` — labelled \"Edit version\" for draft and \"View this version\"\
    \ for released, so the route itself is present regardless of state — <Link to=\"/cases/$slug/versions/$version\"\
    \ params={versionParams}>\n              Edit version\n            </Link>\n...\n        <Link to=\"\
    /cases/$slug/versions/$version\" params={versionParams}>\n            View this version\n        \
    \  </Link>\nsrc/routes/case-simulation-screen.tsx: held at the `loading` branch and the `load-error`\
    \ branch, each rendering `<CaseVersionEditorLink slug={slug} version={version} />` — <p>Loading version\
    \ {version}…</p>\n<CaseVersionEditorLink slug={slug} version={version} />\n\nsrc/routes/case-version-editor-link.tsx:\
    \ held at the Link element returned by CaseVersionEditorLink, lines 13-17 — <Link to=\"/cases/$slug/versions/$version\"\
    \ params={{ slug, version }}>\n      Edit version\n    </Link>\nsrc/routes/version-manifest-screen.tsx:\
    \ held at CaseVersionEditorLink, rendered in all four phase branches — <CaseVersionEditorLink slug={slug}\
    \ version={version} />"
  encoded_at:
  - src/routes/case-simulation-header.tsx
  - src/routes/case-simulation-screen.tsx
  - src/routes/case-version-editor-link.tsx
  - src/routes/version-manifest-screen.tsx
  decided_by: test
  step: test
  proof:
  - src/routes/case-simulation-screen.spec.ts
  - src/routes/version-manifest-screen-editor-link.spec.ts
- node: rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading
  conforms: false
  how: "src/routes/case-simulation-screen.tsx, the `loading` branch (`state.phase === \"loading\"`) and\
    \ the `load-error` branch (`state.phase === \"load-error\"`): <section>\n  <p>Loading version {version}…</p>\n\
    \  <CaseVersionEditorLink slug={slug} version={version} />\n</section>\n...\n<section>\n  <p>Unable\
    \ to load this version right now.</p>\n  <Button type=\"button\" onClick={state.retryLoad}>\n    Retry\n\
    \  </Button>\n  <CaseVersionEditorLink slug={slug} version={version} />\n</section>\n — Both readings\
    \ of this version-keyed surface carry a route to the version's own editing surface but no route to\
    \ the version's own manifest, so a curator who reaches this screen while the read is pending or has\
    \ failed has no way from here to the manifest — the one screen `a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading`\
    \ says should carry that route regardless of what the read answered is, on these two readings, a screen\
    \ carrying only the editor's sibling route and not this one."
  observed_at:
  - src/routes/case-version-editor-screen.tsx
- node: rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state
  conforms: true
  how: 'src/routes/case-version-editor-ready-view.tsx: held at `toManifestRow`''s `state` field, falling
    back to a pending cell while the pin''s own read has not resolved — const pinnedState = pinnedStates.get(entry.position)
    ?? STILL_UNRESOLVED_PIN_STATE; ... state: pinnedRevisionStateCell(pinnedState),

    src/routes/version-manifest-screen.tsx: held at PinnedRevisionStateBadge, rendered from usePinnedRevisionState/pinnedRevisionStateCell
    in both the loading and loaded row states — <PinnedRevisionStateBadge cell={pinnedStateCell} />'
  encoded_at:
  - src/routes/case-version-editor-ready-view.tsx
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at The \"load-error\" phase returned for versionQuery.isError\
    \ || isGlossaryError. — if (versionQuery.isError || isGlossaryError) { return { phase: \"load-error\"\
    , retryLoad: () => {\nsrc/hooks/use-not-valid-draft-version-state.ts: held at the versionsQuery error\
    \ branch, lines 65-73 — if (versionsQuery.isError) {\n    return {\n      phase: \"load-error\",\n\
    \      retryLoad: () => {\n        void versionsQuery.refetch();\n        retryVersionQuery();\n \
    \     },\n    };\n  }\nsrc/routes/case-version-editor-screen.tsx: held at the load-error branch, lines\
    \ 28-40 — <p>Unable to load this version right now.</p>\nsrc/routes/version-manifest-screen.tsx: held\
    \ at the load-error branch's undifferentiated message, the closest analogue in this file to the fallback\
    \ this node describes (this node's own subject is a case-keyed surface, and this file is version-keyed)\
    \ — <p>Unable to load this manifest right now.</p>"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-not-valid-draft-version-state.ts
  - src/routes/case-version-editor-screen.tsx
  - src/routes/version-manifest-screen.tsx
  decided_by: reading
  remainder: testable
  remainder_why: 'Each gap is one input against one result. First, stub read-case (the version path) with
    the unrecognized-code refusal. Assert the hook resolves to exactly { phase: "load-error", retryLoad
    }. Second, add the same exact-keys assertion to the versions-list refusal. Third, make a read fail
    without any refusal, for example with a fetch that rejects. Assert it resolves to the same exact state
    as the unrecognized refusal. Finally, render the editor screen over the unrecognized refusal. Assert
    its text matches the text for a failed read and contains neither "SomeUnrecognizedError" nor "SECRET-MESSAGE".'
- node: rules/knowledge/a-release-refusal-with-no-named-violation-says-so
  conforms: true
  how: 'src/routes/case-version-editor-ready-view.tsx: held at the release dialog''s violations block
    — {release.violations.length === 0 ? (<p className="text-sm text-destructive">No specific violation
    was returned.</p>) : ( ... )}'
  encoded_at:
  - src/routes/case-version-editor-ready-view.tsx
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at releaseMutation''s onError branch for "case-version-not-releasable".
    — if (kind === "case-version-not-releasable") { setReleaseViolations(extractReleaseViolations(error));
    return; }

    src/routes/case-version-editor-ready-view.tsx: held at the same violations list, which names every
    violated hypothesis a refused release returns — <ul className="flex flex-col gap-1 text-sm text-destructive">{release.violations.map((violation)
    => (<li key={violation}>! {violation}</li>))}</ul>

    src/routes/version-manifest-screen.tsx: held at nowhere as gating — this screen never refuses or blocks
    release; the pinned-revision state badge merely discloses each pin''s draft/released state, which
    is what this node''s own rationale (a-presented-manifest-entry-states-its-pinned-revisions-state)
    reads as the input the gate later reads — <PinnedRevisionStateBadge cell={pinnedStateCell} />'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-version-editor-ready-view.tsx
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/a-surface-offering-release-states-which-release-conditions-the-draft-meets
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at releaseCondition, computed unconditionally and\
    \ stated on the release control before any release is attempted. — const releaseCondition = manifestPinReleaseCondition(\
    \ record.manifest ?? [], manifestPinnedStates, ); ... conditions: [releaseCondition],\nsrc/hooks/use-not-valid-draft-version-state.ts:\
    \ held at nowhere — the object this hook returns for the not-valid reading carries no release-related\
    \ field at all. — return {\n    phase: \"not-valid\",\n    form,\n    status,\n    isBlocked: status\
    \ === \"saving\" || status === \"conflict\",\n    outcomeOptions,\n    actionOptions,\n    recipientOptions,\n\
    \    onSubmit,\n    onFieldBlur,\n    onCancel,\n    discard: ...\n  };\nsrc/routes/case-version-editor-ready-view.tsx:\
    \ held at the release-conditions section rendered ahead of, and independent of, the release dialog\
    \ — {release.conditions.map((condition) => (<li key={condition.label}>{RELEASE_CONDITION_STATUS_LABEL[condition.status]}:\
    \ {condition.label}</li>))}"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-not-valid-draft-version-state.ts
  - src/routes/case-version-editor-ready-view.tsx
- node: rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
  conforms: false
  how: "src/routes/case-simulation-screen.spec.ts, the \"route to the named version's own editor across\
    \ every reading\" test, criterion 3 (the read refused with CaseVersionNotValidError, lines ~177-187),\
    \ compared against criterion 2 (the read that did not complete, lines ~164-172): // criterion 2: the\
    \ read did not complete\nconst failedFetch: FetchFn = async () => {\n  throw new Error(\"network down\"\
    );\n};\nawait mountCaseSimulationScreen(failedFetch);\nexpect(await screen.findByText(\"Unable to\
    \ load this version right now.\")).toBeTruthy();\n...\n// criterion 3: the read was refused with CaseVersionNotValidError\n\
    const refusedFetch: FetchFn = async () =>\n  jsonResponse(\n    { error: { code: \"CaseVersionNotValidError\"\
    , message: \"validation failed\" } },\n    409,\n  );\nawait mountCaseSimulationScreen(refusedFetch);\n\
    expect(await screen.findByText(\"Unable to load this version right now.\")).toBeTruthy(); — The node\
    \ requires the surface to state the CaseVersionNotValidError refusal \"distinct from what the same\
    \ surface states for a read of that version that did not complete, so that a reader tells the two\
    \ apart\" — a version failing validation is one the curator must correct, a read that did not complete\
    \ is one to attempt again. This test pins both conditions to the identical text \"Unable to load this\
    \ version right now.\", so as written it passes exactly when the surface renders the two indistinguishably\
    \ to the curator — the confusion the node names as sending \"the reader to the wrong act\" — and a\
    \ curator meeting the validation refusal is told nothing that points them toward correcting the draft\
    \ rather than retrying a read no retry can ever complete."
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-not-valid-draft-version-state.ts
  - src/routes/case-version-editor-not-valid-view.tsx
  - src/routes/case-version-editor-screen.tsx
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/an-abandoned-case-version-edit-writes-nothing
  conforms: true
  how: "src/hooks/use-edit-draft-version-form.ts: held at cancelEditing, wired as onCancel on the ready\
    \ phase. — const cancelEditing = (): void => { router.history.back(); }; ... onCancel: cancelEditing,\n\
    src/hooks/use-not-valid-draft-version-state.ts: held at nowhere in this file — onCancel arrives as\
    \ a caller-supplied parameter and is only forwarded, never given its own logic here. — onCancel,\n\
    src/routes/case-version-editor-not-valid-view.tsx: held at the Cancel button — <Button type=\"button\"\
    \ variant=\"secondary\" onClick={state.onCancel}>\n  Cancel\n</Button>\nsrc/routes/case-version-editor-ready-view.tsx:\
    \ held at the unconditional Cancel control at the foot of the form — <Button type=\"button\" variant=\"\
    secondary\" onClick={state.onCancel}>Cancel</Button>"
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-not-valid-draft-version-state.ts
  - src/routes/case-version-editor-not-valid-view.tsx
  - src/routes/case-version-editor-ready-view.tsx
- node: rules/knowledge/an-accepted-update-draft-answers-its-versions-own-stored-declared-attributes
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at patchMutation''s onSuccess, resetting the form
    directly from the PATCH response. — onSuccess: (data) => { isSubmittingRef.current = false; resetFormFrom(form,
    data); setStatus("clean");'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  conforms: false
  how: 'src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts, the outer `describe` title, lines
    51-54: "useEditDraftVersionForm -- a draft refused by read-case with CaseVersionNotValidError is read
    " + "through read-case-version, and its own declared attributes fill the editable form " + "(criteria
    1, 2, 3, 4, 5, 6, 7, 8; rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record)"
    — a-draft-versions-content-is-presented-only-from-its-own-record is decided over "a case version v
    created through create-draft" and the interval before that version''s own answer has arrived; its
    own decision-log entry records it as sibling to a-newly-created-draft-offers-no-act-before-its-own-record-arrives
    on exactly that ground. This file never creates a draft and never exercises a pending-read interval
    — it stubs an existing version refused by validation at an ordinary read. A reader following this
    citation to find where the pending-created-draft rule is proved will find this file instead, and a
    reader trying to find test coverage for an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
    — the node whose own decision-log entry ("a curator be able to correct a draft case version''s own
    declared attributes ... without first having to place a hypothesis to make the version read back as
    a case") matches exactly what this file''s assertions demonstrate — will not find it credited here.'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-not-valid-draft-version-state.ts
  - src/routes/case-version-editor-not-valid-view.tsx
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: false
  how: 'no named file holds this fact now: src/hooks/use-edit-draft-version-form.ts read `nowhere` — The
    file fetches vocabulary lists (useGlossaryVocabularyOptions("outcome"), ("action"), ("recipient"),
    line 124) but performs no check that a case version''s own named terms exist in them.'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: 'src/routes/version-manifest-screen.tsx: held at the row rendering order, taken as-given from state.rows,
    with move-up/move-down controls that change only position — const rows = state.rows.map((row) => toStatusRow(row,
    rowsDisabled, slug));'
  encoded_at:
  - src/routes/version-manifest-screen.tsx
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at canDiscard, passed to buildDiscardControlState.
    — canDiscard: record.state === "draft" && !isReleased,

    src/hooks/use-not-valid-draft-version-state.ts: held at line 111 — canDiscard: notValidVersionState
    === "draft",'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-not-valid-draft-version-state.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'Each unexercised part is one input against one expected result: (a) on the released
    not-valid reading, wait until the versions listing has been answered, then assert no Discard draft
    control; (b) mount the valid reading for a released version and assert no Discard draft control, and
    for a draft assert one; (c) send DELETE for a released version and assert it is refused and the version
    still reads back; (d) discard a draft whose manifest references a hypothesis-revision and assert that
    revision still reads back, referenced by nothing.'
- node: rules/knowledge/releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act
  conforms: true
  how: "src/routes/case-version-editor-ready-view.tsx: held at the release Dialog, whose trigger only\
    \ opens the dialog and whose own Release button is the separate, further confirming act — <DialogTrigger\
    \ asChild><Button type=\"button\" disabled={state.isBlocked}>Release…</Button></DialogTrigger> ...\
    \ <Button type=\"button\" loading={release.isConfirming} onClick={release.onConfirm}>Release</Button>\n\
    src/routes/discard-draft-dialog.tsx: held at the confirm `Button` inside `DialogFooter`, a distinct\
    \ control from the trigger button that merely asks for the dialog to open. — <Button\n  type=\"button\"\
    \n  variant=\"destructive\"\n  loading={discard.isConfirming}\n  disabled={!discard.isConfirmEnabled\
    \ || discard.isConfirming}\n  onClick={discard.onConfirm}\n>\n  Discard draft\n</Button>\n"
  encoded_at:
  - src/routes/case-version-editor-ready-view.tsx
  - src/routes/discard-draft-dialog.tsx
- node: scenarios/knowledge/a-case-with-no-hypothesis-is-still-discardable
  conforms: true
  how: 'src/hooks/use-not-valid-draft-version-state.ts: held at the discard construction, lines 106-118
    — gated on state alone, with no manifest/hypothesis check — canDiscard: notValidVersionState === "draft",'
  encoded_at:
  - src/hooks/use-not-valid-draft-version-state.ts
- node: scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-not-valid-draft-version-state.ts,
    src/routes/case-version-editor-not-valid-view.tsx, and src/hooks/use-edit-draft-version-form.ts read
    `nowhere` — The scenario''s behavior is delegated to useNotValidDraftVersionState via the "case-not-valid"
    flag (line 202); this file only forwards it. — a binding asserts the file answers for the node, so
    the pair that stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-not-valid-draft-version-state.ts
  - src/routes/case-version-editor-not-valid-view.tsx
- node: scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
  conforms: true
  how: 'src/hooks/use-edit-draft-version-form.ts: held at releaseMutation''s onError branch for "case-version-not-releasable".
    — setReleaseViolations(extractReleaseViolations(error));

    src/routes/case-version-editor-ready-view.tsx: held at the same violations list rendering — {release.violations.map((violation)
    => (<li key={violation}>! {violation}</li>))}'
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-version-editor-ready-view.tsx
- node: scenarios/knowledge/placing-a-manifest-entry-is-never-refused-for-a-drafts-revision-state
  conforms: true
  how: 'src/routes/version-manifest-screen.tsx: held at the revision options built for RevisionSelect,
    which include every answered revision with no filtering by that revision''s own state — const options
    = optionsWithPinnedRevision(revisions, row.revision);'
  encoded_at:
  - src/routes/version-manifest-screen.tsx
unbound:
- src/hooks/use-edit-draft-version-form-not-valid-actions.spec.ts
- src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts
- src/hooks/use-edit-draft-version-form-not-valid-marking.spec.ts
- src/routes/case-simulation-screen.spec.ts
- src/routes/case-version-editor-screen-refused-draft-discard.spec.ts
- src/routes/case-version-editor-screen-refused-draft-save.spec.ts
- src/routes/case-version-editor-screen-refused-draft.spec.ts
- src/routes/version-manifest-screen-editor-link.spec.ts
notes: 'Judged by 18 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/case-version-editable-when-invalid-frontend.returns/.

  Certification of rules/knowledge/a-draft-case-versions-discard-reproduces-the-cases-own-slug did not
  hold: the auditor answered `partial` — On the editor''s not-valid draft reading, three cases are tested.
  Confirming with nothing typed issues no discard. Confirming with the slug plus an added suffix ("<slug>-not-the-slug")
  issues no discard. Confirming with the slug typed exactly issues exactly one DELETE. So an editor that
  discards without the slug fails these tests. An editor that accepts any value starting with or containing
  the slug also fails them. Two parts of the fact are still unexercised. First, this file only exercises
  the not-valid reading. The discard offered on the editor''s ordinary draft reading is never exercised
  here, so an editor that discards there without the slug passes this proof. The helper module''s name
  suggests a sibling discard spec may cover that reading, but it was not offered as proof and is not cited.
  Second, no near-miss value other than an added suffix is typed. A value that is a strict prefix of the
  slug, or the slug with different letter case, is never submitted. So an editor accepting "the slug begins
  with what was typed" or a case-insensitive match would pass these tests, even though the curator has
  not reproduced the case''s own slug.. The node is decided by reading, and a certification standing on
  it from an earlier reconciliation is released by the bind. The remainder is testable: On the editor''s
  ordinary draft reading, confirm the discard with a value other than the case''s slug and expect no DELETE,
  then with the exact slug and expect exactly one DELETE. On either reading, confirm with a strict prefix
  of the slug (the slug minus its last character) and with a case-varied slug, and expect no DELETE for
  either..

  Certified rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading
  as decided by step `test`: src/routes/case-simulation-screen.spec.ts (carries the route while pending,
  once failed to complete, once refused for validation, and once answered for a draft and for a released
  version, always addressed by the screen''s own path version); src/routes/case-simulation-screen.spec.ts
  (still carries the route to the named version''s own editor when the read is refused with an error code
  other than CaseVersionNotValidError); src/routes/case-simulation-screen.spec.ts (renders the ready header
  for a draft version''s own slug/version pair); src/routes/version-manifest-screen-editor-link.spec.ts
  (renders an Edit version link to /cases/$slug/versions/$version, carrying the manifest screen''s own
  path version, while the read is still pending, once it has failed to complete, once it has been refused
  with CaseVersionNotValidError, once it has answered a draft version and once it has answered a released
  version) would fail if the fact stopped holding.

  Certification of rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  did not hold: the auditor answered `partial` — One read the surface makes for the case is fully exercised:
  read-case-version (declared-attributes). When it is refused with a code the hook does not present (SomeUnrecognizedError,
  500, message SECRET-MESSAGE), the first named test asserts two things. The phase is "load-error", so
  the refusal is not shown as not-valid or ready. The state holds exactly the keys phase and retryLoad,
  so the test would fail if the code, the message, a carried value or any version attribute were exposed.
  Three parts of the fact are not exercised. (1) "The same statement it makes for any read of that case
  that did not complete, indistinguishable from it": no test makes a read fail without a refusal, such
  as a rejected fetch. Nothing compares that outcome''s state with the refusal''s state. A hook giving
  transport failures a different phase or shape than refusals would pass. (2) The case''s other reads:
  nothing refuses read-case (the version path) with an unrecognized code. Every refusal of that read in
  the set is CaseVersionNotValidError, a code the surface does present. The versions-list read is refused
  with an unrecognized code only in the second named test. That test asserts only phase "load-error",
  not the exact key set. A hook that put the code or SECRET-MESSAGE beside that phase would pass, so non-disclosure
  on that read is unexercised. (3) The proof works at the hook''s state, not the rendered surface. Nothing
  in the offered proof checks what the screen says for load-error, or that it shows neither the code nor
  the message.. The node is decided by reading, and a certification standing on it from an earlier reconciliation
  is released by the bind. The remainder is testable: Each gap is one input against one result. First,
  stub read-case (the version path) with the unrecognized-code refusal. Assert the hook resolves to exactly
  { phase: "load-error", retryLoad }. Second, add the same exact-keys assertion to the versions-list refusal.
  Third, make a read fail without any refusal, for example with a fetch that rejects. Assert it resolves
  to the same exact state as the unrecognized refusal. Finally, render the editor screen over the unrecognized
  refusal. Assert its text matches the text for a failed read and contains neither "SomeUnrecognizedError"
  nor "SECRET-MESSAGE"..

  Certification of rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
  did not hold: the auditor answered `partial` — These parts of the fact are exercised: the screen shows
  the explicit statement for a refused draft and does not show the load-error text, and it stops showing
  the statement once the same version reads back cleanly. Five parts are not exercised. (1) The statement
  is only rendered on the screen for a draft. A released version refused with CaseVersionNotValidError
  is only tested at the hook, as the bare "not-valid" phase. Nothing mounts the screen for that reading,
  so the screen could drop the statement for a released version and every offered test would still pass.
  (2) "Neither is presented as the other" is only tested in one direction. No screen test renders a read
  of (s, n) that did not complete and asserts the not-valid statement is absent there. The hook tests
  only fail the prerequisite reads (the versions listing and declared-attributes). None fails the read
  of the named version itself (a 5xx or a network failure on GET of the version path) and asserts the
  result is load-error, not not-valid. (3) Only some of the version''s attributes are checked for absence.
  The screen test checks that the cached title, when_to_use and a manifest entry''s hypothesis name do
  not appear, and that there is no table and no Manifest heading. The cached subject, fallback and consolidation_register
  have the same values as the draft''s own record, so a test on them could not fail. Nothing asserts that
  the cached state ("released"), authored_at, the entry''s position or the pinned revision''s criterion
  ("CACHED-SECRET-CRITERION") are absent, and no cached released_at is seeded at all. (4) A note, not
  something I decide here: the cache-leak assertions can only fail if the key seeded in the test, ["case-version",
  SLUG, 3], is the key the screen actually reads. The pack confines this reading to the proof, so that
  key was not checked against the source. (5) This test, and sibling tests in the same file, assert that
  the refused draft''s own declared attributes (title, when_to_use, subject, fallback, consolidation_register)
  are shown in the editable form. The node says the surface presents no attribute of the version "as the
  content standing at that identity", and leaves what a surface offers to other nodes. Whether a form
  seeded from declared-attributes counts as that content is for a person to decide. Nothing here settles
  it.. The node is decided by reading, and a certification standing on it from an earlier reconciliation
  is released by the bind. The remainder is testable: Three screen-level assertions would close it. (a)
  Mount the version editor for a released version whose read returns 409 CaseVersionNotValidError. Expect
  the statement "This version does not read back as a case" and none of the version''s attributes or manifest
  entries. (b) Mount it for a read of (s, n) that does not complete (a 5xx or a network failure on the
  version path). Expect the load-error text and no not-valid statement. (c) Seed a cached record whose
  subject, fallback, consolidation_register, state, authored_at, released_at, entry position and pinned-revision
  criterion all differ from the draft''s own record. Expect none of those values to be rendered on the
  not-valid reading..

  Certification of rules/knowledge/only-a-draft-case-version-may-be-discarded did not hold: the auditor
  answered `partial` — The first named test puts a draft against a released version, and only on the not-valid
  reading (the version read refused with CaseVersionNotValidError). It fails if the editor offers Discard
  draft for a released version, or withholds it for a draft. The second named test only bears on the draft
  side: a draft whose manifest holds an entry is still offered the discard. The released half is weaker
  than it looks. It checks that the control is absent right after the not-valid statement appears, with
  no wait for the versions listing that carries the version''s state. Unless that statement only renders
  after the listing is answered, the absence can be read before the state gate is evaluated, so an editor
  that did offer discard on a released version could still pass. Three parts of the fact are not exercised
  at all. First, the editor''s ordinary (valid) reading is never mounted in this file, so the rule is
  only exercised on the not-valid reading. Second, "a released version is never removed" is only exercised
  as a control not being offered. Nothing sends a DELETE against a released version and checks that it
  is refused and the version still reads back. Third, the node''s description says discarding removes
  the version and its own manifest entries but never the hypothesis-revisions they referenced. No test
  discards a draft and then reads a referenced revision back. The test only uses the states draft and
  released. If a case version can hold any other state, nothing checks that the offer is withheld for
  it. The other three tests in the file bear on the slug confirmation and the 204 outcome of a discard,
  not on this fact. Any test elsewhere that exercises the valid reading or the server-side refusal is
  outside the offered proof and is not cited here.. The node is decided by reading, and a certification
  standing on it from an earlier reconciliation is released by the bind. The remainder is testable: Each
  unexercised part is one input against one expected result: (a) on the released not-valid reading, wait
  until the versions listing has been answered, then assert no Discard draft control; (b) mount the valid
  reading for a released version and assert no Discard draft control, and for a draft assert one; (c)
  send DELETE for a released version and assert it is refused and the version still reads back; (d) discard
  a draft whose manifest references a hypothesis-revision and assert that revision still reads back, referenced
  by nothing..

  Staged by a review over files a delivery wrote: every pair a delivery or a hand stamped was judged,
  and a pair was omitted only where a reconciliation''s judgment had cleared it at these very bytes; the
  plan''s node(s) rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case,
  scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing, rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case,
  rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name, rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record,
  rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives, rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete,
  rules/knowledge/a-surface-offering-release-states-which-release-conditions-the-draft-meets, rules/knowledge/an-abandoned-case-version-edit-writes-nothing,
  contracts/knowledge/case-query, domain/knowledge/case-version, constraints/a-successful-case-version-own-record-read-answers-with-http-200,
  rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading, rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading,
  rules/knowledge/an-accepted-update-draft-answers-its-versions-own-stored-declared-attributes, rules/knowledge/a-discard-is-offered-and-accepted-while-its-drafts-current-read-does-not-answer-a-case,
  rules/knowledge/only-a-draft-case-version-may-be-discarded, rules/knowledge/releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act,
  rules/knowledge/a-draft-case-versions-discard-reproduces-the-cases-own-slug, scenarios/knowledge/a-case-with-no-hypothesis-is-still-discardable,
  constraints/a-successful-case-version-discard-answers-with-no-content were read on every file and answered
  for, and bound from nowhere here — a binding this record writes is one the trace already held.

  Candidates: 0 opened across 0 of 18 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/case-version-editable-when-invalid-frontend.returns/`, which are the evidence behind every entry above.
