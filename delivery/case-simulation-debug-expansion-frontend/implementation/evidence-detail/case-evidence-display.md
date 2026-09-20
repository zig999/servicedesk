---
target: frontend
title: Case-level Debug Evidence tab
summary: Adds a fourth Evidence tab to the case result Debug block, presenting one
  entry per evidence item the shown run collected, reusing the per-hypothesis Evidence
  tab's own per-item rendering (extracted into a shared component) rather than duplicating
  it.
task: sha256:be6670fe041b1141aca409d06d4bade7c08fe8f609a1268f421fdddf4d111dbc
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/evidence-detail-case-evidence-display-build
files:
- path: src/routes/case-simulation-evidence-item.tsx
  effect: new. Extracts the per-item evidence rendering previously inline in case-simulation-detail-evidence-tab.tsx
    into a shared CaseSimulationEvidenceItem component. The Observation block now
    renders only when item.result === "ok"; for a non-ok item no Observation block
    is rendered at all. Inputs are masked through redactResolvedCredentialValue before
    pretty-printing
- path: src/routes/case-simulation-case-result-evidence-tab.tsx
  effect: new. CaseSimulationCaseResultEvidenceTab renders one CaseSimulationEvidenceItem
    per item in its evidence prop, or an empty-state message when empty
- path: src/routes/case-simulation-detail-evidence-tab.tsx
  effect: CaseSimulationDetailEvidenceTab now delegates each matched item's rendering
    to the shared CaseSimulationEvidenceItem component; collects-filtering and judgment-summary-line
    logic unchanged; now-unused local helpers/imports removed
- path: src/routes/case-simulation-case-result-json-tab.tsx
  effect: exported the previously-private redactResolvedCredentialValue function for
    reuse; no behavior change to this file's own component
- path: src/routes/case-simulation-cockpit-adapters.ts
  effect: 'added toDetailEvidenceFromRawResponse(rawResponse: unknown), which defensively
    narrows an object carrying an evidence array and hands it to the existing toDetailEvidence()
    adapter'
- path: src/routes/case-simulation-case-result-panel.tsx
  effect: computes shownRunEvidence = toDetailEvidenceFromRawResponse(shownRun.rawResponse)
    and adds an Evidence TabsTrigger/TabsContent as the first tab in the case-level
    Debug's Tabs; defaultValue stays "prompt"
criteria:
- criterion: After a case simulation run, the case result Debug presents one entry
    for each evidence item that run returned.
  met: true
  how: CaseSimulationCaseResultEvidenceTab maps over evidence, computed as toDetailEvidenceFromRawResponse(shownRun.rawResponse)
- criterion: An evidence item whose result is not ok is presented with its result,
    and no observation is claimed for it.
  met: true
  how: the status dot and result_detail always render; the Observation block renders
    only when item.result === "ok"
- criterion: Each entry presents that item's observed_at, ttl, inputs and capability
    payload notes.
  met: true
  how: rendered unconditionally per item, inputs pretty-printed through redactResolvedCredentialValue
    first
- criterion: Each entry presents concept_description and field semantics from the
    item's own snapshot, issuing no glossary or capability-registry read.
  met: true
  how: renderConceptDescription/renderFieldSemantics read only the item's own snapshotted
    fields with no fetch
- criterion: The entries presented are the shown run's own, so selecting an earlier
    run in the session history presents that run's evidence.
  met: true
  how: shownRunEvidence is derived from shownRun.rawResponse, the same run the existing
    Show mechanism selects
nodes:
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/routes/case-simulation-case-result-panel.tsx
  - src/routes/case-simulation-cockpit-adapters.ts
  how: the Evidence tab presents exactly the evidence array the run's own rawResponse
    already carries, issuing no second read
- node: domain/investigation/evidence
  encoded_at:
  - src/routes/case-simulation-evidence-item.tsx
  how: every attribute this task's criteria name is read straight off the item and
    rendered, with the honest-empty renderings inherited unchanged from the per-hypothesis
    rendering
- node: rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked
  encoded_at:
  - src/routes/case-simulation-evidence-item.tsx
  - src/routes/case-simulation-case-result-json-tab.tsx
  how: inputs pass through redactResolvedCredentialValue before pretty-printing, the
    same mechanism already reviewed for the case-level JSON tab, now reused on both
    Evidence surfaces
- node: rules/investigation/an-evidence-item-whose-result-is-not-ok-records-an-empty-observation
  encoded_at:
  - src/routes/case-simulation-evidence-item.tsx
  how: implemented through its reader clause -- no Observation section renders at
    all when item.result !== "ok"
- node: rules/investigation/a-simulation-session-retains-its-runs-and-shows-one
  encoded_at:
  - src/routes/case-simulation-case-result-panel.tsx
  how: the Evidence tab reads shownRun's own record via the existing shownRun/shownRunId
    selection
- node: rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
  encoded_at:
  - src/routes/case-simulation-evidence-item.tsx
  how: observed_at is rendered as the item's own wire string, verbatim, suffixed UTC
- node: rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
  encoded_at:
  - src/routes/case-simulation-evidence-item.tsx
  how: ttl is rendered as the item's own bare number with no recomputation
- node: rules/investigation/presentation-reads-the-evidence-snapshot
  encoded_at:
  - src/routes/case-simulation-evidence-item.tsx
  how: concept_description, fields and capability_payload_notes are read only from
    the item's own snapshot, no glossary or registry call issued
inferences:
- inferred: The per-item evidence rendering belongs in one shared component consumed
    by both the per-hypothesis and case-level Evidence tabs, rather than a second
    implementation.
  from: this task's own Notes directing reuse, and the inventory's must_not_duplicate
    entries naming exactly this rendering
- inferred: The no-Observation-for-non-ok and masked-inputs behaviors now also apply
    to the already-delivered per-hypothesis Evidence tab, not only the new case-level
    one.
  from: both governing rules are stated over an operator-facing surface generically,
    not scoped to one tab; giving the case-level tab a different answer than the per-hypothesis
    tab to the same rule would itself be the duplication the inventory warns against
- inferred: redactResolvedCredentialValue is exported and reused rather than reimplemented.
  from: the task's own wording treats an exposed reusable function as the trigger
    for reuse
- inferred: shownRun.rawResponse is read through defensive structural narrowing rather
    than widening CaseResultRun.rawResponse's declared type.
  from: many existing tests construct rawResponse as an arbitrary marker object; narrowing
    at the read site avoids retyping a field those tests depend on staying unconstrained
- inferred: The new Evidence tab is placed first in the case-level Debug's TabsList,
    while defaultValue stays "prompt".
  from: mirrors the per-hypothesis Debug's own Evidence-first tab order; defaultValue
    unchanged because an existing test asserts the Prompt tab's content is visible
    without a click
- inferred: item.concept is used as the React list key in both Evidence tabs.
  from: matches the per-hypothesis tab's own key convention; concept is a stable,
    unique identifier per item within one run
preserved:
- The per-hypothesis Evidence tab's collects-filtering, empty state, and judgment-summary
  line, unchanged.
- The evidence-result status-dot color mapping and every existing rendering for result_detail,
  concept_description, field semantics and capability_payload_notes, now sourced from
  the shared component with identical markup apart from the two corrected behaviors
  this task's own criteria and implemented nodes require.
- The case-level Debug's existing Prompt, Totals and JSON tabs and the shownRun/shownRunId
  selection mechanism, untouched.
- CaseResultRun/NewCaseResultRun's declared shape, and every existing caller constructing
  a rawResponse value of any shape for that field.
---

## What it is
The case-level counterpart of the per-hypothesis Evidence tab, covering every concept the run collected rather than one hypothesis's own, sharing its per-item rendering with the per-hypothesis tab rather than duplicating it.

## Notes
This task's own reading of the governing rules extends two behaviors (masking inputs, showing no Observation for a non-ok item) to the already-delivered per-hypothesis Evidence tab as well, since both rules are stated generically over any operator-facing evidence surface and the shared-component reuse this task's own Notes direct would otherwise leave the two tabs answering the same rule differently.
