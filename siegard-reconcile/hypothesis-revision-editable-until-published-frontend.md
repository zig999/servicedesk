---
contract_version: siegard-reconcile/3
title: hypothesis revision editable until published — frontend
summary: Two frontend tasks (epic hypothesis-revision-repin-affordance) delivering the hypothesis-editing
  form's own pinned-revision read and the success surface's conditional manifest-builder offer, plus a
  pre-existing lint-rule fix to case-simulation-case-result-panel.tsx unrelated to either task's own behavior.
target: frontend
files:
- path: src/hooks/use-hypothesis-revision-form-pinned-revision.spec.ts
  change: written by the delivery of task/hypothesis-revision-repin-affordance/pinned-revision-in-hand-before-a-save
    as its proof.
- path: src/hooks/use-hypothesis-revision-form-repin-offer.spec.ts
  change: written by the delivery of task/hypothesis-revision-repin-affordance/repin-offered-only-when-the-pin-fell-behind
    as its proof.
- path: src/hooks/use-hypothesis-revision-form.test-support.ts
  change: modified by the delivery of both tasks as their proof's shared test support — createWrapper's
    return now also exposes queryClient.
- path: src/hooks/use-hypothesis-revision-form.ts
  change: 'written by the delivery of task/hypothesis-revision-repin-affordance/pinned-revision-in-hand-before-a-save:
    widens the case-version read to type the manifest and expose pinnedRevisionFor(manifest, hypothesisName)
    as a pinnedRevision field on the ready phase; then written by task/hypothesis-revision-repin-affordance/repin-offered-only-when-the-pin-fell-behind:
    captures the pinned revision immediately before each revise mutation and computes an offerManifestBuilder
    boolean on the success phase from the answered revision versus the captured pin.'
- path: src/routes/case-simulation-case-result-panel.tsx
  change: 'a pre-existing, unrelated react/no-array-index-key lint failure fixed as a direct edit (frontend
    is declared edits_freely) while delivering task/hypothesis-revision-repin-affordance/pinned-revision-in-hand-before-a-save,
    which the standard''s whole-tree lint step reached: each rendered paragraph is now keyed by its own
    text instead of array index. No behavior a person can observe changed.'
- path: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
  change: written by the delivery of task/hypothesis-revision-repin-affordance/repin-offered-only-when-the-pin-fell-behind
    as its proof.
- path: src/routes/hypothesis-revision-screen.tsx
  change: 'written by the delivery of task/hypothesis-revision-repin-affordance/repin-offered-only-when-the-pin-fell-behind:
    renders the "Open Manifest Builder" button only when the success state''s offerManifestBuilder is
    true; the saved-revision message stays unconditional.'
nodes:
- node: contracts/investigation/case-simulation
  conforms: true
  how: 'src/routes/case-simulation-case-result-panel.tsx: held at the rendering of the curator-facing
    detail a simulate-case run returns — outcome, referral, determining hypothesis, and the labelled customer-facing
    text with its register (lines 40-51) — Outcome {lastRun.outcome} · Referral {lastRun.referral.action}
    /{" "}

    {lastRun.referral.recipient} · Determining{" "}

    {lastRun.determiningHypothesis ?? "Fallback"}'
  encoded_at:
  - src/routes/case-simulation-case-result-panel.tsx
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at reviseMutation's mutationFn, invoking the revise-hypothesis\
    \ operation — return apiFetch<RevisedHypothesis>(`/v1/cases/${encodeURIComponent(slug)}/hypotheses`,\
    \ {\n        method: \"POST\","
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at revisionsQuery's queryFn, invoking the list-hypothesis-revisions\
    \ operation — apiFetch<HypothesisRevisionsPage>(\n        `/v1/cases/${encodeURIComponent(slug)}/hypotheses/${encodeURIComponent(hypothesisName\
    \ ?? \"\")}/revisions`,\n      ),"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: domain/glossary/action
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-form.ts: held at actionOptions hook and the resolution.referral.action
    form field — const actionOptions = useGlossaryVocabularyOptions("action");'
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: domain/glossary/concept
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at availableConcepts filter and the collects field\
    \ — const availableConcepts = conceptOptions.concepts.filter((concept) =>\n  concept.accepts.includes(subjectType),\n\
    );"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: domain/glossary/outcome
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-form.ts: held at outcomeOptions hook and the resolution.outcome
    form field — const outcomeOptions = useGlossaryVocabularyOptions("outcome");'
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: domain/glossary/recipient
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-form.ts: held at recipientOptions hook and the resolution.referral.recipient
    form field — const recipientOptions = useGlossaryVocabularyOptions("recipient");'
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: domain/glossary/subject-type
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-form.ts: held at subjectType read from the case version and
    used to filter concepts — const subjectType = versionQuery.data.subject;'
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: domain/investigation/assessment
  conforms: true
  how: 'src/routes/case-simulation-case-result-panel.tsx: held at the display of the assessment''s outcome,
    referral, determining_hypothesis, text and register attributes (lines 40-57) — Customer-facing text
    ({lastRun.register})'
  encoded_at:
  - src/routes/case-simulation-case-result-panel.tsx
- node: domain/knowledge/case-version
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at CaseVersionSubject type and versionQuery fetching\
    \ the version by slug and number — type CaseVersionSubject = {\n  readonly subject: string;\n  readonly\
    \ manifest: readonly ManifestEntryDto[];\n};"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-form.ts: held at hypothesisNameEditable, which locks the name
    once an identity already exists — hypothesisNameEditable: hypothesisName === null,'
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at HypothesisRevisionListItem type and the fields\
    \ sent on revise — type HypothesisRevisionListItem = {\n  readonly revision: number;\n  readonly criterion:\
    \ string;\n  readonly collects: readonly string[];\n  readonly resolution: HypothesisRevisionFormValues[\"\
    resolution\"];\n};"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at ManifestEntryDto type and pinnedRevisionFor's\
    \ lookup — type ManifestEntryDto = {\n  readonly hypothesis_revision: {\n    readonly hypothesis:\
    \ { readonly name: string };\n    readonly revision: number;\n  };\n};"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: domain/knowledge/referral
  conforms: true
  how: 'src/routes/case-simulation-case-result-panel.tsx: held at the referral action/recipient interpolation
    (lines 41-42) — Referral {lastRun.referral.action} /{" "}

    {lastRun.referral.recipient}'
  encoded_at:
  - src/routes/case-simulation-case-result-panel.tsx
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at the availableConcepts filter restricting selectable\
    \ concepts to the version's subject type — const availableConcepts = conceptOptions.concepts.filter((concept)\
    \ =>\n  concept.accepts.includes(subjectType),\n);"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at pinnedRevisionFor's manifest.find, which trusts\
    \ at most one entry per hypothesis — const entry = manifest.find(\n  (item) => item.hypothesis_revision.hypothesis.name\
    \ === hypothesisName,\n);"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at the revise mutation, which sends the draft\
    \ version's own subject with the revision request — if (versionQuery.data === undefined) {\n     \
    \   throw new Error(\"cannot submit a hypothesis revision before the draft's subject type has loaded\"\
    );\n      }\nconst body = {\n        hypothesis_name: values.hypothesis_name,\n        criterion:\
    \ values.criterion,\n        collects: values.collects,\n        resolution: values.resolution,\n\
    \        subject: versionQuery.data.subject,\n      };"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-form.ts: held at the ready phase''s pinnedRevision, read from
    the manifest entry rather than the paged revisions list — pinnedRevision: pinnedRevisionFor(versionQuery.data.manifest,
    hypothesisName),'
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: rules/knowledge/a-revise-answers-the-revision-number-it-saved
  conforms: true
  how: 'src/routes/hypothesis-revision-screen.tsx: held at the success-phase paragraph — Hypothesis "{state.hypothesisName}"
    saved as revision {state.revision}.'
  encoded_at:
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
  conforms: true
  how: "src/hooks/use-hypothesis-revision-form.ts: held at offerManifestBuilder, comparing the written\
    \ revision against the pin captured immediately before the revise — offerManifestBuilder: pinnedBeforeSave\
    \ === null || revision > pinnedBeforeSave,\nsrc/routes/hypothesis-revision-screen.tsx: held at the\
    \ success-phase conditional button — {state.offerManifestBuilder && (\n          <Button type=\"button\"\
    \ onClick={state.onOpenManifestBuilder}>\n            Open Manifest Builder\n          </Button>\n\
    \        )}"
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-screen.tsx
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: 'src/hooks/use-hypothesis-revision-form.ts: held at the glossary-backed option hooks constraining
    which vocabulary terms the form can select — const conceptOptions = useConceptOptions();

    const outcomeOptions = useGlossaryVocabularyOptions("outcome");

    const actionOptions = useGlossaryVocabularyOptions("action");

    const recipientOptions = useGlossaryVocabularyOptions("recipient");'
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
- node: scenarios/investigation/a-draft-case-version-is-simulated
  conforms: true
  how: 'src/routes/case-simulation-case-result-panel.tsx: held at the panel''s overall rendering of a
    simulated run''s resolved outcome, referral, determining hypothesis and consolidated text (lines 40-57)
    — Outcome {lastRun.outcome} · Referral {lastRun.referral.action} /{" "}

    {lastRun.referral.recipient} · Determining{" "}

    {lastRun.determiningHypothesis ?? "Fallback"}'
  encoded_at:
  - src/routes/case-simulation-case-result-panel.tsx
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  conforms: false
  how: 'no named file holds this fact now: src/routes/case-simulation-case-result-panel.tsx read `nowhere`
    — Outcome {lastRun.outcome} · Referral {lastRun.referral.action} /{" "} — every rendered run is read
    for an outcome and a referral unconditionally, so this file has no branch representing a hypothesis-only
    simulation that resolves neither; that case is not surfaced here'
  observed_at:
  - src/routes/case-simulation-case-result-panel.tsx
unbound:
- src/hooks/use-hypothesis-revision-form-pinned-revision.spec.ts
- src/hooks/use-hypothesis-revision-form-repin-offer.spec.ts
- src/hooks/use-hypothesis-revision-form.test-support.ts
- src/routes/hypothesis-revision-screen-repin-offer.spec.ts
notes: 'Judged by 7 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/hypothesis-revision-editable-until-published-frontend.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown,
  rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version, rules/knowledge/a-case-has-at-most-one-draft,
  domain/knowledge/case-version, domain/knowledge/manifest-entry, domain/knowledge/hypothesis-revision,
  domain/knowledge/hypothesis, rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move,
  rules/knowledge/a-revise-answers-the-revision-number-it-saved were read on every file and answered for,
  and bound from nowhere here — a binding this record writes is one the trace already held.

  Candidates: 3 opened across 2 of 7 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/hypothesis-revision-editable-until-published-frontend.returns/`, which are the evidence behind every entry above.
