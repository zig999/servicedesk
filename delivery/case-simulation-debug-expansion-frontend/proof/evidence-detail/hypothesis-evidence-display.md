---
target: frontend
title: Per-hypothesis Evidence tab presents observed_at, ttl, inputs and capability
  payload notes
summary: New tests over case-simulation-detail-evidence-tab.tsx cover the five new
  render obligations this task adds; criterion 6 is left to the pre-existing snapshot
  tests since that behavior did not change; every node the task implements is recorded
  untested because none is decidable whole by a test confined to this presentational
  component.
implementation: sha256:855ca3d10183c2721512a2859fe89ecef8b20ab36fcc0992619fbbca9538dfc7
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/evidence-detail-hypothesis-evidence-display-suite
tests:
- file: src/routes/case-simulation-detail-evidence-tab-metadata.spec.ts
  name: observed_at is shown as the raw UTC instant the item carries (criterion 1)
    > renders the item's own observed_at string verbatim, suffixed UTC, with no local-zone
    or Date-object reformatting
  proves: criterion 1
  fails_when: the tab shows a value other than the item's own observed_at string suffixed
    UTC, or no observed_at text at all
- file: src/routes/case-simulation-detail-evidence-tab-metadata.spec.ts
  name: ttl is shown as a bare count of seconds read off the item (criterion 2) >
    renders the item's own ttl number, suffixed with seconds, with no recomputation
    or unit conversion
  proves: criterion 2
  fails_when: the tab shows a ttl number different from the item's own ttl, in a different
    unit, recomputed, or omitted
- file: src/routes/case-simulation-detail-evidence-tab-metadata.spec.ts
  name: inputs are shown for the collected item (criterion 3) > shows the inputs the
    collection was issued with, pretty-printed inside a collapsible Inputs block
  proves: criterion 3
  fails_when: the tab omits the item's own inputs, or shows a value other than what
    the item's inputs carry
- file: src/routes/case-simulation-detail-evidence-tab-metadata.spec.ts
  name: capability payload notes are shown exactly as snapshotted (criterion 4) >
    renders the item's own capability_payload_notes text verbatim
  proves: criterion 4
  fails_when: the tab shows text other than the item's own capability_payload_notes
    verbatim, or shows nothing when the item carries notes
- file: src/routes/case-simulation-detail-evidence-tab-metadata.spec.ts
  name: empty capability payload notes render as no notes, never a substitute (criterion
    5) > renders no notes text and no invented placeholder when the item's own capability_payload_notes
    is empty
  proves: criterion 5
  fails_when: the tab shows any invented placeholder text in place of an empty capability_payload_notes
- file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
  name: shows a present concept_description (criterion 1) > renders the item's own
    concept_description alongside it
  proves: criterion 6's concept_description clause -- pre-existing test, unchanged
    by this task
  fails_when: the tab shows a concept_description other than the exact value the item's
    own snapshot carries
- file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
  name: shows each snapshotted field's name, type and description (criteria 2, 3)
    > renders a field's name, type and description together when the snapshot states
    all three
  proves: criterion 6's field-semantics clause -- pre-existing test, unchanged by
    this task
  fails_when: the tab shows a field's name, type or description different from what
    the item's own fields snapshot states
not_applicable:
- edge_case: Inputs value that does not parse as JSON, falling back to the raw string.
  why: prettyPrintJson's parse-fallback path is a single shared pure helper already
    covered by an existing test over the Observation field
- edge_case: A ttl of zero, negative, or an unusually large magnitude.
  why: no criterion or node this task implements states a bound on ttl's magnitude
    for presentation
- edge_case: An evidence item whose recorded inputs are the empty object {} (the parameterless
    or never-issued collection case).
  why: this task's own Notes mark this UNDERDETERMINED -- nothing in the criteria
    fixes whether the tab should show {} or omit the inputs display, and both are
    criteria-compliant
- edge_case: A dependency (network, clock, storage) that fails or answers slowly.
  why: the component takes only plain props and issues no fetch, timer or storage
    call of its own
- edge_case: Concurrent operations against one subject.
  why: the component triggers no operation at all -- it is a pure function of the
    props it receives
untested:
- 'contracts/investigation/case-simulation: no finite test confined to this presentational
  component decides this contract''s fact whole; this component calls neither simulate
  operation, it only renders fields it is handed.'
- 'domain/investigation/evidence: the value object declares twelve attributes plus
  a capability reference; this task''s tests exercise four of them at presentation
  only.'
- 'rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked:
  the implementation itself could not satisfy this node''s masking clause, by its
  own disclosure -- there is nothing to mask on any data this component can be given,
  so no test can observe masking without inventing a shape the component never receives.
  This is a finding for the reviewer, not something a test can settle.'
- 'rules/investigation/an-evidence-items-observed-at-is-a-utc-instant: this proof''s
  test exercises only the presented slice; it cannot decide whole a fact that also
  governs storage, the wire response and judgment.'
- 'rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation:
  this proof''s test only shows the tab echoes the item''s own ttl verbatim; it does
  not decide whole a fact about how that number was computed or counted at collection.'
- 'rules/investigation/presentation-reads-the-evidence-snapshot: the ''shows the snapshot''
  half is evidenced by the cited tests, but the ''issues no glossary or capability-registry
  read'' half is a structural absence (no such dependency exists on the component''s
  props or imports) rather than an observable behavior a render test can intercept,
  so the node''s fact as a whole is not decided by any single finite test.'
- 'This task''s own UNDERDETERMINED note on rules/investigation/an-evidence-item-that-sent-no-inputs-records-an-empty-object:
  no test asserts either rendering behavior for the {} case; left open per this proof''s
  own direction to exclude pinning that implementation.'
divergences:
- cites: TST-04
  file: src/routes/case-simulation-detail-evidence-tab-metadata.spec.ts
  departure: the new test file is named case-simulation-detail-evidence-tab-metadata.spec.ts
    rather than exactly the unit's own name plus .spec
  why: the unit's own base spec already splits across three sibling files by concern
    under the same prefix; this file follows that same established convention rather
    than growing any one of those three past a size nobody can hold in their head
---

## What it is
The proof for task/evidence-detail/hypothesis-evidence-display: that the per-hypothesis Evidence tab presents observed_at, ttl, inputs and capability payload notes as their governing rules require, to the extent this presentational component's own data allows.

## Notes
None.
