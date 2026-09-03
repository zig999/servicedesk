---
contract_version: siegard-reconcile/3
title: Manifest shortcuts on the hypothesis-editing and case-detail screens
summary: Two tasks add standing routes to a case version's manifest — an always-visible "View Manifest"
  control on the hypothesis-editing screen's ready phase, and a per-row "Manifest" link on every row of
  the case-detail screen's Versions panel, for both draft and released versions.
target: frontend
files:
- path: src/hooks/use-hypothesis-revision-form-manifest-shortcut.spec.ts
  change: new test file proving the ready-phase onOpenManifest field and its reuse by the success phase
- path: src/hooks/use-hypothesis-revision-form.ts
  change: extracts the existing navigate-to-manifest call into a shared openManifest closure and exposes
    it as onOpenManifest on the ready-phase state, reused by the existing success-phase onOpenManifestBuilder
- path: src/routes/case-detail-screen-manifest-action.spec.ts
  change: new test file proving the per-row Manifest link's presence, targeting, ordering and read-only
    behavior on a released row
- path: src/routes/case-detail-screen-view-released-action.spec.ts
  change: existing link-count assertion corrected from two to three to account for the new Manifest link
- path: src/routes/case-detail-screen.tsx
  change: actionsForRow renders a third "Manifest" link, reusing the row's existing shared params object,
    unconditional on version.state
- path: src/routes/case-hypotheses-tab.test-support.ts
  change: adds a manifestRoute/VersionManifestScreen stub to the shared router-mounting test helper
- path: src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
  change: new test file proving the ready-phase "View Manifest" button's presence, target and non-duplication
- path: src/routes/hypothesis-revision-screen.tsx
  change: renders an unconditional "View Manifest" button in the ready-phase branch, before the form fields
nodes:
- node: contracts/investigation/case-simulation
  conforms: true
  how: "src/routes/case-detail-screen.tsx: held at actionsForRow's Simulate link — <Link to=\"/cases/$slug/versions/$version/simulate\"\
    \ params={params}>\n        Simulate\n      </Link>"
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at reviseMutation (mutationFn), POST /v1/cases/{slug}/hypotheses\
    \ — return apiFetch<RevisedHypothesis>(`/v1/cases/${encodeURIComponent(slug)}/hypotheses`, {\n   \
    \     method: \"POST\","
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at versionQuery and revisionsQuery useQuery calls\
    \ — queryFn: () =>\n      apiFetch<CaseVersionSubject>(`/v1/cases/${encodeURIComponent(slug)}/versions/${version}`),\n\
    src/routes/case-detail-screen.tsx: held at VersionsPanel's use of useCaseVersions(slug) — const {\
    \ data, isLoading, isError, refetch } = useCaseVersions(slug);"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/case-detail-screen.tsx
- node: domain/glossary/action
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-form.ts: held at actionOptions = useGlossaryVocabularyOptions("action")
    — const actionOptions = useGlossaryVocabularyOptions("action");'
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: domain/glossary/concept
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at conceptOptions / collectsOptions filtering\
    \ — const availableConcepts = conceptOptions.concepts.filter((concept) =>\n  concept.accepts.includes(subjectType),\n\
    );"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: domain/glossary/outcome
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-form.ts: held at outcomeOptions = useGlossaryVocabularyOptions("outcome")
    — const outcomeOptions = useGlossaryVocabularyOptions("outcome");'
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: domain/glossary/recipient
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-form.ts: held at recipientOptions = useGlossaryVocabularyOptions("recipient")
    — const recipientOptions = useGlossaryVocabularyOptions("recipient");'
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: domain/glossary/subject-type
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-form.ts: held at subjectType derived from versionQuery.data.subject,
    used to filter concepts — const subjectType = versionQuery.data.subject;'
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: domain/knowledge/case
  conforms: true
  how: 'src/routes/case-detail-screen.tsx: held at slug read from the route and threaded through the panel
    and its links — const { slug } = useParams({ from: "/cases/$slug" });'
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: domain/knowledge/case-version
  conforms: false
  how: 'the fact left part of its ground: still held in src/hooks/use-hypothesis-revision-form.ts, src/routes/case-detail-screen.tsx,
    and src/routes/hypothesis-revision-screen.tsx read `nowhere` — readonly version: number; — a binding
    asserts the file answers for the node, so the pair that stopped holding it is released by `--bind
    ... --replace`, never restamped here'
  observed_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/case-detail-screen.tsx
  - src/routes/hypothesis-revision-screen.tsx
- node: domain/knowledge/case-version-state
  conforms: true
  how: "src/routes/case-detail-screen.tsx: held at STATE_CELL lookup keyed by the two enumeration values\
    \ — const STATE_CELL: Record<CaseVersionState, { color: string; label: string }> = {\n  draft: { color:\
    \ \"bg-warning\", label: \"Draft\" },\n  released: { color: \"bg-success\", label: \"Released\" },\n\
    };"
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: domain/knowledge/hypothesis
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-form.ts: held at hypothesisNameEditable and reviseMutation body''s
    hypothesis_name — hypothesisNameEditable: hypothesisName === null,'
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at HypothesisRevisionListItem type and reviseMutation\
    \ body (criterion, collects, resolution) — const body = {\n        hypothesis_name: values.hypothesis_name,\n\
    \        criterion: values.criterion,\n        collects: values.collects,\n        resolution: values.resolution,"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at pinnedRevisionFor — const entry = manifest.find(\n\
    \  (item) => item.hypothesis_revision.hypothesis.name === hypothesisName,\n);\nreturn entry === undefined\
    \ ? null : entry.hypothesis_revision.revision;"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: "src/routes/case-detail-screen.tsx: held at hasDraft gating the New draft link — const hasDraft\
    \ = data.data.some((version) => version.state === \"draft\");\n\n  return (\n    <>\n      {!hasDraft\
    \ && (\n        <Link to=\"/cases/$slug/versions/new\" params={{ slug }}>\n          New draft\n \
    \       </Link>\n      )}"
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-form.ts: held at availableConcepts filter — concept.accepts.includes(subjectType)'
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at pinnedRevisionFor's single .find lookup — const\
    \ entry = manifest.find(\n  (item) => item.hypothesis_revision.hypothesis.name === hypothesisName,\n\
    );"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-form.ts: held at reviseMutation body''s subject field, taken
    from the draft version query — subject: versionQuery.data.subject,'
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest
  conforms: true
  how: "src/routes/case-detail-screen.tsx: held at actionsForRow's unconditional Manifest link, present\
    \ for both states — <Link to=\"/cases/$slug/versions/$version/manifest\" params={params}>\n      \
    \  Manifest\n      </Link>"
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-form.ts: held at pinnedRevision field of the "ready" phase,
    computed from versionQuery.data.manifest rather than the paged revisionsQuery — pinnedRevision: pinnedRevisionFor(versionQuery.data.manifest,
    hypothesisName),'
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: rules/knowledge/a-revise-answers-the-revision-number-it-saved
  conforms: true
  how: 'src/routes/hypothesis-revision-screen.tsx: held at the success-phase paragraph, lines 39-41 —
    Hypothesis "{state.hypothesisName}" saved as revision {state.revision}.'
  encoded_at:
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at offerManifestBuilder computation in the \"\
    success\" phase — offerManifestBuilder: pinnedBeforeSave === null || revision > pinnedBeforeSave,\n\
    src/routes/hypothesis-revision-screen.tsx: held at the conditional render at lines 42-46 — {state.offerManifestBuilder\
    \ && (\n          <Button type=\"button\" onClick={state.onOpenManifestBuilder}>\n            Open\
    \ Manifest Builder\n          </Button>\n        )}"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-form.ts: held at conceptOptions/outcomeOptions/actionOptions/recipientOptions
    all sourced dynamically rather than hardcoded — const conceptOptions = useConceptOptions();

    const outcomeOptions = useGlossaryVocabularyOptions("outcome");'
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: 'src/routes/case-detail-screen.tsx: held at rows built from the whole version listing, each carrying
    a route to view it — const rows = data.data.map((version) => toRow(slug, version));'
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
  conforms: true
  how: "src/routes/case-detail-screen.tsx: held at the explicit empty-listing branch — {rows.length ===\
    \ 0 ? (\n\n        <p>This case currently holds no version.</p>\n      ) : ("
  encoded_at:
  - src/routes/case-detail-screen.tsx
unbound:
- src/hooks/use-hypothesis-revision-form-manifest-shortcut.spec.ts
- src/routes/case-detail-screen-manifest-action.spec.ts
- src/routes/case-detail-screen-view-released-action.spec.ts
- src/routes/case-hypotheses-tab.test-support.ts
- src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
notes: 'Judged by 8 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/manifest-shortcuts.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) domain/knowledge/case-version,
  rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move, rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest
  were read on every file and answered for, and bound from nowhere here — a binding this record writes
  is one the trace already held.

  Candidates: 5 opened across 2 of 8 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/manifest-shortcuts.returns/`, which are the evidence behind every entry above.
