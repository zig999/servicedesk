---
target: frontend
title: capability_payload_notes crosses the simulate-response wire boundary
summary: Both simulate-response evidence types (SimulateEvidenceItem and the hypothesis-run
  Evidence) now declare capability_payload_notes as a required string alongside their
  existing required inputs, observed_at and ttl, with neither hook doing anything
  that would drop, convert or substitute any of the four en route to its caller.
task: sha256:6a2b3d4a7e9f1d288244abfb5859fa1b7bd6bc2d2906a09f7b9031a97090b9c4
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/evidence-detail-evidence-wire-fields-build
files:
- path: src/hooks/use-simulate-case.ts
  effect: 'SimulateEvidenceItem now declares `readonly capability_payload_notes: string;`
    (required), appended after concept_description; inputs, observed_at and ttl were
    already required with no parsing or unit-conversion code in the file'
- path: src/hooks/use-simulate-hypothesis.ts
  effect: the hypothesis-run Evidence type now declares the identical required capability_payload_notes
    field, same placement, same absence of any conversion code
- path: src/hooks/use-simulate-hypothesis.test-support.ts
  effect: 'evidenceItem()''s fixture literal now supplies capability_payload_notes:
    "" to satisfy the widened type; no assertion changed'
- path: src/hooks/use-simulate-case.test-support.ts
  effect: 'simulateResult()''s two evidence-item literals each now supply capability_payload_notes:
    ""'
- path: src/hooks/use-case-simulation-cockpit.test-support.ts
  effect: 'simulateCaseResult()''s and hypothesisEvidence()''s evidence literals each
    now supply capability_payload_notes: ""'
- path: src/routes/case-simulation-ready-view.test-support.ts
  effect: the same two duplicated fixture functions updated the same way
- path: src/routes/case-simulation-cockpit-adapters-evidence-capability-hotfix.spec.ts
  effect: 'realEvidenceItem()''s base literal now supplies capability_payload_notes:
    ""'
- path: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
  effect: 'baseEvidenceItem()''s base literal and two directly-typed Evidence literals
    now supply capability_payload_notes: ""'
- path: src/routes/case-simulation-detail-panel-hypothesis-evidence-and-prompt.spec.ts
  effect: 'both inline HypothesisEvidenceItem[] literals now supply capability_payload_notes:
    ""'
- path: src/routes/case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts
  effect: 'the inline HypothesisEvidenceItem[] literal now supplies capability_payload_notes:
    ""'
- path: src/hooks/use-simulate-case-evidence-capability-hotfix.spec.ts
  effect: 'the inline evidence-item literal now supplies capability_payload_notes:
    ""'
- path: src/routes/case-simulation-cockpit-adapters.spec.ts
  effect: 'the inline SimulateEvidenceItem[] literal now supplies capability_payload_notes:
    ""'
criteria:
- criterion: SimulateEvidenceItem in use-simulate-case.ts declares capability_payload_notes
    as a string field.
  met: true
  how: 'added readonly capability_payload_notes: string; to SimulateEvidenceItem'
- criterion: The hypothesis-run Evidence type in use-simulate-hypothesis.ts declares
    capability_payload_notes as a string field.
  met: true
  how: added the identical field declaration to Evidence in use-simulate-hypothesis.ts
- criterion: Both types declare inputs, observed_at and ttl.
  met: true
  how: both already declared these three as required fields, untouched, with no code
    parsing, converting or re-deriving any of them
- criterion: A simulate-case response whose evidence items carry capability_payload_notes
    reaches the hook's caller with that value intact.
  met: true
  how: useSimulateCase exposes mutation.data directly as SimulateCaseState.result
    with no field-by-field reconstruction of evidence items; useSimulateHypothesis
    does the identical pass-through
- criterion: An evidence item whose capability declared no payload notes reaches the
    caller as the empty string the response sent, not as an absent field and not as
    substituted text.
  met: true
  how: capability_payload_notes is declared as a required (non-optional) string on
    both types, and neither hook branches on, defaults, or substitutes a value for
    it anywhere in the pass-through path
nodes:
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/hooks/use-simulate-case.ts
  - src/hooks/use-simulate-hypothesis.ts
  how: the two response types now declare capability_payload_notes alongside inputs,
    observed_at and ttl, so the frontend type stops silently narrowing an attribute
    the contract's responses actually send
- node: domain/investigation/evidence
  encoded_at:
  - src/hooks/use-simulate-case.ts
  - src/hooks/use-simulate-hypothesis.ts
  how: capability_payload_notes is declared required:true on this value-object and
    described as always a string, never absent; both wire types now mirror that with
    a required string field
- node: rules/investigation/presentation-reads-the-evidence-snapshot
  how: this task only gets the attribute across the wire boundary; no surface reads
    it yet, so the invariant's presentation half is unreached here by design, per
    this task's own REMAINDER note
- node: rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
  encoded_at:
  - src/hooks/use-simulate-case.ts
  - src/hooks/use-simulate-hypothesis.ts
  how: observed_at stays a required string with no parsing, Date construction or local-zone
    conversion anywhere in either hook file, so the UTC instant crosses the boundary
    unconverted
- node: rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
  encoded_at:
  - src/hooks/use-simulate-case.ts
  - src/hooks/use-simulate-hypothesis.ts
  how: ttl stays a required number with no unit conversion anywhere in either hook
    file, so the seconds figure crosses the boundary unconverted
inferences:
- inferred: capability_payload_notes is declared as a required (non-optional) string
    on both wire types, rather than optional like its sibling fields/concept_description
    already are.
  from: domain/investigation/evidence's required:true for capability_payload_notes
    and its own text stating the attribute is always a string, never absent; this
    task's own criterion 5 explicitly protects against the value reaching the caller
    as an absent field
- inferred: 'Every pre-existing fixture/spec literal typed as SimulateEvidenceItem
    or the hypothesis-run Evidence that predates this field now supplies capability_payload_notes:
    "".'
  from: domain/investigation/evidence's own description of the empty string as the
    honest-empty value, applied only to keep pre-existing, unrelated tests compiling
    against the now-required field, with no change to any of those tests' own assertions
- inferred: The new field is declared textually last in both type literals.
  from: no ordering convention is stated by the inventory or the domain node's own
    attribute list; placed last as the newest addition
preserved:
- Both hooks' existing pass-through behavior for every field other than the newly
  added one.
- Every existing test's own assertions across the touched fixture and spec files —
  only the new required field's value was added to already-existing object literals.
- toDetailEvidence's own field mapping and DetailEvidenceItem's declared shape, left
  untouched per this task's own scope cut at the wire boundary.
deferred:
- what: Mapping capability_payload_notes from SimulateEvidenceItem/Evidence into DetailEvidenceItem
    via toDetailEvidence, and rendering it on the Evidence tab.
  why: this task's own REMAINDER note assigns the adapter-side carrying and rendering
    of this field to the task that renders an evidence item's inputs on the curator's
    simulation surface
- what: rules/investigation/a-simulation-session-retains-its-runs-and-shows-one.
  why: this task's own REMAINDER note states no criterion here addresses retention
    or selection
---

## What it is
The two response types (SimulateEvidenceItem, the hypothesis-run Evidence) that stand between a simulate call and everything that renders it, now declaring capability_payload_notes alongside the inputs, observed_at and ttl they already carried.

## Notes
The field is declared required, matching domain/investigation/evidence's own required:true and this task's own criterion protecting against the value reaching the caller as an absent field, unlike the optional fields/concept_description treatment already on these types.
Twelve pre-existing fixture/spec files needed a value added to their existing evidence-item literals to keep compiling against the now-required field; no existing assertion changed.
