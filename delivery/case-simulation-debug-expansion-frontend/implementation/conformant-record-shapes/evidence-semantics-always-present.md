---
target: frontend
title: Evidence fields/concept_description are required, honest-empty snapshots everywhere
summary: SimulateEvidenceItem, Evidence and SimulationEvidenceItem now declare fields and concept_description
  as required members carrying domain/investigation/evidence's honest-empty value, the two evidence-item
  render functions collapse their absent-vs-empty branches into one, and every fixture and assertion across
  the frontend that constructed or checked these two attributes -- in scope and out of it -- was repaired
  in lockstep so the tree still compiles and the suite still passes.
task: sha256:55e29b8c4a9f1fdffdcdbfb430b796c66227465c360d0c5bdc29ccb9bca9b454
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/conformant-record-shapes-evidence-semantics-always-present-build-2
files:
- path: src/hooks/use-simulate-case.ts
  effect: SimulateEvidenceItem.fields and .concept_description lost their `?` and are now required members
- path: src/hooks/use-simulate-hypothesis.ts
  effect: Evidence.fields and .concept_description lost their `?` and are now required members
- path: src/routes/case-simulation-detail-types.ts
  effect: SimulationEvidenceItem.fields and .conceptDescription lost their `?` and are now required members
- path: src/routes/case-simulation-evidence-item.tsx
  effect: renderConceptDescription and renderFieldSemantics now take non-optional parameters and always
    return a JSX.Element, collapsing the absent-vs-empty branches into one honest-empty rendering
- path: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
  effect: baseEvidenceItem now defaults fields to [] and concept_description to "" instead of omitting
    them; assertions expect the honest-empty value, never undefined
- path: src/routes/case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts
  effect: criterion-1 fixture and expectation moved from undefined to fields:[] / conceptDescription:""
- path: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
  effect: the former criterion-6 block now asserts the same honest-empty rendering its siblings assert,
    instead of a distinct absent-branch rendering
- path: src/routes/case-simulation-detail-panel.test-support.ts
  effect: testEvidenceItem's default object now supplies fields:[] and conceptDescription:""
- path: src/hooks/use-simulate-case-evidence-wire-fields.spec.ts
  effect: baseEvidenceItem's default now supplies fields:[] / concept_description:"" to keep compiling
    against the now-required type
- path: src/hooks/use-simulate-hypothesis-evidence-wire-fields.spec.ts
  effect: baseEvidenceItem's default now supplies fields:[] / concept_description:"" for the same reason
- path: src/hooks/use-case-simulation-cockpit.test-support.ts
  effect: shared simulateCaseResult and hypothesisEvidence() fixtures' evidence-item literals now supply
    fields:[] / concept_description:""
- path: src/hooks/use-case-simulation-cockpit-hypothesis-evidence-and-prompt.spec.ts
  effect: both the first describe block's inline, untyped mock-response evidence literal (the
    one jsonResponse(body:unknown) let bypass the compiler's required-field check) and the second
    describe block's toEqual expectation now carry fields:[] / concept_description:"" (conceptDescription:""
    on the expected side) instead of omitting them / asserting undefined
- path: src/hooks/use-case-simulation-cockpit-evaluations.spec.ts
  effect: same toEqual correction against simulateHypothesisResult()'s evidence
- path: src/routes/case-simulation-ready-view.test-support.ts
  effect: its own duplicate simulateCaseResult/hypothesisEvidence fixtures' evidence-item literals now
    supply fields:[] / concept_description:""
- path: src/hooks/use-simulate-case.test-support.ts
  effect: simulateResult()'s two default evidence-item literals now supply fields:[] / concept_description:""
- path: src/hooks/use-simulate-hypothesis.test-support.ts
  effect: evidenceItem()'s literal now supplies fields:[] / concept_description:""
- path: src/routes/case-simulation-case-result-panel-evidence.spec.ts
  effect: local evidenceItem() builder's default now supplies fields:[] / concept_description:""
- path: src/routes/case-simulation-case-result-evidence-tab.spec.ts
  effect: local testItem() builder's default now supplies fields:[] / conceptDescription:""
- path: src/routes/case-simulation-evidence-item.spec.ts
  effect: local testItem() builder's default now supplies fields:[] / conceptDescription:""
- path: src/routes/case-simulation-case-result-json-tab.spec.ts
  effect: local evidenceItem() builder's default now supplies fields:[] / concept_description:""
- path: src/routes/case-simulation-cockpit-adapters-evidence-adapter-fields.spec.ts
  effect: local baseEvidenceItem() builder's default now supplies fields:[] / concept_description:""
- path: src/routes/case-simulation-cockpit-adapters.spec.ts
  effect: the direct SimulateEvidenceItem literal under toDetailEvidence's full-case-run test now supplies
    and expects fields:[] / concept_description:""
- path: src/routes/case-simulation-detail-evidence-tab-capability-hotfix.spec.ts
  effect: local realDetailEvidenceItem() builder's default now supplies fields:[] / conceptDescription:""
- path: src/hooks/use-simulate-case-evidence-capability-hotfix.spec.ts
  effect: direct SimulateEvidenceItem literal now supplies fields:[] / concept_description:""
- path: src/routes/case-simulation-detail-panel-hypothesis-evidence-and-prompt.spec.ts
  effect: both direct HypothesisEvidenceItem literals now supply fields:[] / concept_description:""
- path: src/routes/case-simulation-cockpit-adapters-evidence-capability-hotfix.spec.ts
  effect: local realEvidenceItem() builder's default now supplies fields:[] / concept_description:""
- path: src/routes/case-simulation-detail-evidence-tab-metadata.spec.ts
  effect: criterion-5 case now overrides conceptDescription/fields to non-empty values and narrows its
    assertion to /payload/i, since the broad prior pattern collided with the two new legitimate honest-empty
    messages
criteria:
- criterion: SimulateEvidenceItem in src/hooks/use-simulate-case.ts declares fields and concept_description
    as required members, with no optional marker on either.
  met: true
  how: both attributes' `?` removed; type-checked against every construction site in the tree
- criterion: The Evidence type in src/hooks/use-simulate-hypothesis.ts declares fields and concept_description
    as required members, with no optional marker on either.
  met: true
  how: same removal on Evidence
- criterion: SimulationEvidenceItem in src/routes/case-simulation-detail-types.ts declares fields and
    conceptDescription as required members, with no optional marker on either.
  met: true
  how: same removal on SimulationEvidenceItem
- criterion: toDetailEvidence in src/routes/case-simulation-cockpit-adapters.ts carries fields and conceptDescription
    from the source item with no fallback for an absent value.
  met: true
  how: 'already true of the existing code (`fields: item.fields, conceptDescription: item.concept_description`
    with no `??` or ternary); no edit was needed there'
- criterion: renderConceptDescription in src/routes/case-simulation-evidence-item.tsx has one rendering
    for an empty concept_description and no separate rendering for an absent one.
  met: true
  how: the undefined-returns-null branch is gone; the function takes `string` and always renders
- criterion: renderFieldSemantics in src/routes/case-simulation-evidence-item.tsx has one rendering for
    an empty fields list and no separate rendering for an absent one.
  met: true
  how: same collapse; function takes `readonly SimulationFieldSemantics[]`
- criterion: An evidence item whose concept_description is the empty string renders exactly what the item's
    own snapshot carries, with no glossary value substituted for the emptiness.
  met: true
  how: renderConceptDescription's only substitution is the literal stated-absence sentence the node itself
    calls for, never a glossary read; no such read exists in this file or its adapter
- criterion: An evidence item whose fields list is empty renders exactly what the item's own snapshot
    carries, with no capability-registry value substituted for the emptiness.
  met: true
  how: same reasoning for renderFieldSemantics; no capability-registry read exists on this path
- criterion: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts asserts the honest-empty
    value for a bare item's fields and concept_description and asserts undefined for neither.
  met: true
  how: file rewritten; every toBeUndefined() on these two attributes is gone, replaced by toEqual([])
    / toBe("")
- criterion: src/routes/case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts asserts
    the honest-empty value for a bare item's conceptDescription and asserts undefined for it nowhere.
  met: true
  how: the criterion-1 fixture and its expectation both moved from undefined to "" / []
- criterion: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts holds no assertion of a rendering
    distinct from its empty-value siblings for an item carrying no snapshot at all.
  met: true
  how: the former criterion-6 block now asserts the same two stated-absence texts criteria 4 and 5 already
    assert for an item built with no explicit override
- criterion: testEvidenceItem in src/routes/case-simulation-detail-panel.test-support.ts returns a SimulationEvidenceItem
    supplying both fields and conceptDescription by default.
  met: true
  how: default object updated
- criterion: The frontend type-checks with no error arising from fields or concept_description in any
    file that declares, converts or renders an evidence item.
  met: true
  how: traced every literal construction of SimulateEvidenceItem/Evidence/SimulationEvidenceItem across
    the tree and supplied fields/concept_description on each one; captured build run passed typecheck
    cleanly
nodes:
- node: domain/investigation/evidence
  how: fields and concept_description are modeled as required attributes end-to-end (wire types, detail
    type) and every reader treats an absent value as impossible rather than a case of its own; the render
    functions show the node's own stated honest-empty degradation rather than inventing a third absent
    state the element itself does not hold
  encoded_at:
  - src/hooks/use-simulate-case.ts
  - src/hooks/use-simulate-hypothesis.ts
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-evidence-item.tsx
  - src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
  - src/routes/case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts
  - src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
  - src/routes/case-simulation-detail-panel.test-support.ts
- node: rules/investigation/presentation-reads-the-evidence-snapshot
  how: toDetailEvidence (unedited, already conformant) carries the snapshot through with no glossary or
    capability-registry read; renderConceptDescription and renderFieldSemantics show only what the item's
    own snapshot carries, with the one substitution being the node's own stated-absence text. capability_payload_notes,
    the statement's third snapshotted thing, is outside this task's own criteria and was not touched
inferences:
- inferred: Fixing the ripple of compile and assertion breakage the type change causes outside the task's
    own nine named files (20 additional files) rather than stopping at the nine.
  from: the task's own criterion 13 is stated without restriction to the task's named area, and the task's
    own rationale already establishes the precedent for folding in exactly this kind of compile-driven
    correction (testEvidenceItem) rather than leaving the tree uncompilable
- inferred: case-simulation-detail-evidence-tab-metadata.spec.ts's criterion-5 test now explicitly overrides
    conceptDescription and fields to non-empty values, and its assertion narrows from the broad /^No .+
    recorded for this/ pattern to /payload/i.
  from: that test's original regex incidentally matched the two new, legitimate stated-absence texts this
    task's criteria 7 and 8 require testEvidenceItem's own default to now render; the payload-notes render
    function itself never emits an invented placeholder for an empty value, so narrowing the check to
    what it actually guards preserves that test's real intent
preserved:
- the evidence item's result color/label, resultDetail line, capability name/version/connector line, elapsedMs/observedAt/ttl
  display, redacted-inputs disclosure, pretty-printed observation disclosure for an ok result, and the
  always-present capability_payload_notes rendering -- none of this task's edits touch that logic
---

## What it is
The two wire-shaped evidence types, the one detail type, the one adapter, and the two render functions that read the result -- corrected so fields and concept_description are always required and always honest-empty, never absent, together with every fixture and assertion across the frontend this ripples into.

## Notes
Fixing the ripple of compile and assertion breakage outside the task's own nine named files (20 additional files -- hook-level and route-level fixtures, local per-spec evidence-item builders, and toEqual expectations reading shared fixtures) rather than stopping at the nine: the task's own criterion 13 is stated without restriction to the named area, and its own rationale already sets the precedent (testEvidenceItem) for folding compile-driven corrections in rather than leaving the tree uncompilable.
case-simulation-detail-evidence-tab-metadata.spec.ts's criterion-5 test now overrides conceptDescription/fields to non-empty values and narrows its assertion to /payload/i, since the broad prior pattern collided with the two new legitimate honest-empty messages this task's criteria 7 and 8 require.
