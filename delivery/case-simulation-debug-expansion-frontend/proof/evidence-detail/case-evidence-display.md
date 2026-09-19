---
target: frontend
title: Case result Debug Evidence tab -- proof
summary: Tests establish that the shared per-item evidence renderer and the new case-level
  Evidence tab present one entry per collected item, mask a resolved credential in
  inputs, omit any Observation claim for a non-ok item while still surfacing its result
  and result_detail, render observed_at and ttl verbatim from the item, and follow
  the shown run's own record when an earlier run is selected.
implementation: sha256:6b37bd7b3f54348bc98c6adb2548030e7779a9bb9ca1a74d71bdf782dbfe2ede
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/evidence-detail-case-evidence-display-suite
tests:
- file: src/routes/case-simulation-evidence-item.spec.ts
  name: CaseSimulationEvidenceItem -- a non-ok item claims no observation > shows
    the item's own result and result_detail, and renders no Observation block, for
    a timeout item
  proves: criterion 2, and the excluded implementation that omits result_detail
  fails_when: the component omits result_detail for a non-ok item, still renders an
    Observation block, or drops the result label
- file: src/routes/case-simulation-evidence-item.spec.ts
  name: CaseSimulationEvidenceItem -- still renders the Observation block, pretty-printed,
    for an ok item
  proves: the boundary of criterion 2
  fails_when: the component stops rendering an Observation block for an ok item
- file: src/routes/case-simulation-evidence-item.spec.ts
  name: CaseSimulationEvidenceItem -- observed_at is shown as the raw UTC instant
    the item carries
  proves: criterion 3's observed_at clause, and the excluded local-zone-conversion
    implementation
  fails_when: the component converts observed_at to the viewer's local time zone,
    or reformats it through a Date object
  demonstrates: rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
- file: src/routes/case-simulation-evidence-item.spec.ts
  name: CaseSimulationEvidenceItem -- ttl is a bare count of seconds read off the
    item
  proves: criterion 3's ttl clause
  fails_when: the component recomputes ttl, converts its unit, or omits the seconds
    suffix
  demonstrates: rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
- file: src/routes/case-simulation-evidence-item.spec.ts
  name: CaseSimulationEvidenceItem -- inputs are shown with a resolved credential
    masked
  proves: criterion 3's inputs clause
  fails_when: the component renders inputs unmasked, uses a different mask text, or
    masks a non-credential value
  demonstrates: rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked
- file: src/routes/case-simulation-case-result-evidence-tab.spec.ts
  name: CaseSimulationCaseResultEvidenceTab -- one entry for each evidence item the
    run returned
  proves: criterion 1
  fails_when: the component renders a different number of entries than items given,
    drops an item, or duplicates one
- file: src/routes/case-simulation-case-result-evidence-tab.spec.ts
  name: CaseSimulationCaseResultEvidenceTab -- renders no entry and an explicit empty
    state when the run returned no evidence
  proves: the boundary of criterion 1 for zero evidence items
  fails_when: the component renders a placeholder entry, an error, or no explicit
    empty state
- file: src/routes/case-simulation-case-result-panel-evidence.spec.ts
  name: CaseSimulationCaseResultPanel -- the Evidence tab presents the shown run's
    own evidence
  proves: criterion 1 through the full run-to-tab wiring, and criterion 5
  fails_when: the panel's Evidence tab shows a different item count than the shown
    run's own evidence, or keeps showing a previous run's evidence after selection
    changes
- file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
  name: CaseSimulationDetailEvidenceTab -- shows a present concept_description, exercised
    through the shared component
  proves: criterion 4's concept_description clause
  fails_when: the shared component stops rendering an item's own non-empty concept_description
- file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
  name: CaseSimulationDetailEvidenceTab -- an empty concept_description renders a
    stated absence, never invented text
  proves: the honest-empty boundary of criterion 4's concept_description clause
  fails_when: the shared component invents text, or shows nothing, for an empty concept_description
- file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
  name: CaseSimulationDetailEvidenceTab -- shows each snapshotted field's name, type
    and description, exercised through the shared component
  proves: criterion 4's field-semantics clause
  fails_when: the shared component drops a field's name, type, or description when
    the snapshot states all three
- file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
  name: CaseSimulationDetailEvidenceTab -- an empty fields snapshot renders a stated
    absence, and the item still renders
  proves: the honest-empty boundary of criterion 4's field-semantics clause
  fails_when: the shared component invents a field, or fails to render the item, for
    an empty fields snapshot
- file: src/routes/case-simulation-detail-evidence-tab-metadata.spec.ts
  name: CaseSimulationDetailEvidenceTab -- capability payload notes are shown exactly
    as snapshotted, exercised through the shared component
  proves: criterion 3's capability-payload-notes clause
  fails_when: the shared component stops rendering an item's own non-empty capability_payload_notes
    verbatim
- file: src/routes/case-simulation-detail-evidence-tab-metadata.spec.ts
  name: CaseSimulationDetailEvidenceTab -- empty capability payload notes render as
    no notes, never a substitute
  proves: the honest-empty boundary of criterion 3's capability-payload-notes clause
  fails_when: the shared component invents placeholder text for an empty capability_payload_notes
not_applicable:
- edge_case: A duplicate concept within one run's evidence array.
  why: no criterion or implemented node claims this display deduplicates or asserts
    concept uniqueness at presentation time
- edge_case: A dependency that fails or answers slowly.
  why: the Evidence tab and its shared item renderer read synchronously from a run
    record already held in memory
- edge_case: Two operations against one subject at once (concurrent run selection).
  why: run retention and selection is a pre-existing mechanism this task's own Notes
    disclaim implementing beyond the evidence slice
untested:
- 'contracts/investigation/case-simulation: its fact spans the backend API surface;
  this task''s own encoding is the narrow slice that the Evidence tab reads the run''s
  already-fetched rawResponse without a second read, not the contract''s whole fact.'
- 'domain/investigation/evidence: its fact is the whole value object including collection-time
  attributes this task''s criteria do not reach (elapsed_ms''s honest-zero, the capability
  reference''s resolution); only the presentation-facing attributes are exercised.'
- 'rules/investigation/an-evidence-item-whose-result-is-not-ok-records-an-empty-observation:
  only its reader clause is reached and tested; its recording clause reaches no criterion
  of this task.'
- 'rules/investigation/a-simulation-session-retains-its-runs-and-shows-one: only its
  evidence-presentation and run-selection slice is answered; its retention machinery
  and its evaluations/assessment/cost/durations clauses reach no criterion of this
  task.'
- 'rules/investigation/presentation-reads-the-evidence-snapshot: the shows-the-snapshot
  half is exercised by the cited tests; the no-live-read half is a structural absence
  with no interceptable dependency to test.'
- The adapter's defensive structural narrowing of shownRun.rawResponse for a malformed
  shape is an inference the implementation recorded, not a fact any criterion or node
  states; no test pins that specific fallback.
---

## What it is
The proof for task/evidence-detail/case-evidence-display: that the case-level Evidence tab presents one entry per collected item with the required detail, and that the shared per-item renderer's two corrected behaviors (masked inputs, no Observation for a non-ok item) hold for both the case-level and the pre-existing per-hypothesis Evidence tab alike, with the full pre-existing suite still green after the refactor.

## Notes
None.
