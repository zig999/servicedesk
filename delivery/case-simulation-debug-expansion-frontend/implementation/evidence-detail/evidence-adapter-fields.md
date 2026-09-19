---
target: frontend
title: toDetailEvidence carries inputs, observedAt, ttl and capabilityPayloadNotes
  forward
summary: SimulationEvidenceItem (DetailEvidenceItem) now declares inputs, observedAt,
  ttl and capabilityPayloadNotes, and toDetailEvidence copies all four straight from
  its argument instead of dropping them; a pre-existing local test fixture was completed
  to satisfy the widened type.
task: sha256:3eb5a3ef427e0cef3ae703f4ba9ceda2abd68b619eb52da250626ae088c7dffa
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/evidence-detail-evidence-adapter-fields-build-2
files:
- path: src/routes/case-simulation-detail-types.ts
  effect: 'SimulationEvidenceItem (re-exported as DetailEvidenceItem) gained four
    required fields: inputs, observedAt, ttl, capabilityPayloadNotes'
- path: src/routes/case-simulation-cockpit-adapters.ts
  effect: toDetailEvidence's mapping now also assigns inputs, observedAt, ttl and
    capabilityPayloadNotes from item.inputs/observed_at/ttl/capability_payload_notes,
    each a direct unconditional read with no fallback
- path: src/routes/case-simulation-detail-panel.test-support.ts
  effect: testEvidenceItem's default fixture gained literal values for the four new
    fields so existing consumers keep compiling
- path: src/routes/case-simulation-detail-evidence-tab-capability-hotfix.spec.ts
  effect: realDetailEvidenceItem's local fixture (from an earlier delivered task)
    gained the same four literal defaults so it satisfies the widened type; no assertion
    in the file was touched
criteria:
- criterion: DetailEvidenceItem declares one field for each of inputs, observed_at,
    ttl and capability payload notes.
  met: true
  how: 'SimulationEvidenceItem declares readonly inputs: string, readonly observedAt:
    string, readonly ttl: number and readonly capabilityPayloadNotes: string'
- criterion: toDetailEvidence, given a response evidence item carrying all four, returns
    a DetailEvidenceItem carrying each of the four values unchanged.
  met: true
  how: toDetailEvidence maps item.inputs -> inputs, item.observed_at -> observedAt,
    item.ttl -> ttl, item.capability_payload_notes -> capabilityPayloadNotes with
    no transformation
- criterion: toDetailEvidence derives those four values from its argument alone, issuing
    no glossary read and no capability-registry read.
  met: true
  how: toDetailEvidence's body is a pure .map over its evidence argument; it imports
    no glossary or capability-registry module
- criterion: Given an item whose capability payload notes are empty, the returned
    item carries that emptiness rather than a substituted value.
  met: true
  how: capabilityPayloadNotes is assigned item.capability_payload_notes directly with
    no fallback or default operator
- criterion: Given an item collected with no inputs, the returned item carries what
    the response sent rather than an invented placeholder.
  met: true
  how: inputs is assigned item.inputs directly with no fallback or default operator
nodes:
- node: domain/investigation/evidence
  encoded_at:
  - src/routes/case-simulation-detail-types.ts
  how: SimulationEvidenceItem's four new fields give the evidence item's UI-facing
    type the same shape the domain node describes
- node: rules/investigation/presentation-reads-the-evidence-snapshot
  encoded_at:
  - src/routes/case-simulation-cockpit-adapters.ts
  how: toDetailEvidence reads only fields already present on its argument and performs
    no additional lookup
- node: rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
  encoded_at:
  - src/routes/case-simulation-cockpit-adapters.ts
  how: observedAt is carried unchanged from item.observed_at with no reformatting
    or substitution
- node: rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
  encoded_at:
  - src/routes/case-simulation-cockpit-adapters.ts
  how: ttl is carried unchanged as a number from item.ttl with no unit conversion
- node: rules/investigation/an-evidence-item-that-sent-no-inputs-records-an-empty-object
  encoded_at:
  - src/routes/case-simulation-cockpit-adapters.ts
  how: inputs is carried unchanged from item.inputs with no fallback
inferences:
- inferred: The four new SimulationEvidenceItem fields are required, matching the
    wire types' own required declarations.
  from: the existing required/optional split this adapter already applies to every
    other required wire field it maps
- inferred: observed_at renames to observedAt (camelCase), ttl keeps its own name,
    following the adapter's existing snake_case-to-camelCase convention.
  from: the inventory's recorded wire-to-UI renaming convention
- inferred: Test fixture default values (inputs "{}", observedAt an ISO timestamp,
    ttl 3600, capabilityPayloadNotes "") added to two fixture files.
  from: no node states a fixture value; chosen to look like values already used in
    nearby spec fixtures, asserted on by no existing consumer
preserved:
- Every other exported function in case-simulation-cockpit-adapters.ts is untouched;
  only toDetailEvidence's own mapping changed.
- The hotfix spec file's two existing assertions were left untouched; only the fixture's
  returned literal was completed.
- The existing spec suite built through case-simulation-detail-panel.test-support.ts's
  testEvidenceItem factory keeps asserting the same values it already asserted.
deferred:
- what: case-simulation-cockpit-adapters.spec.ts's and case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts's
    toEqual expectations on DetailEvidenceItem, missing the four new fields.
  why: neither expected literal carries an explicit type annotation so TypeScript
    raises no compile error; they will fail only as runtime assertion mismatches once
    the suite runs -- an earlier task's test asserting an exact shape this task's
    widening legitimately extends, left for the test-author's suite pass
---

## What it is
The single conversion point from a wire-shaped evidence item to the UI-facing item both Debug blocks read, widened to carry inputs, observedAt, ttl and capabilityPayloadNotes forward instead of dropping them.

## Notes
One pre-existing test file (case-simulation-detail-evidence-tab-capability-hotfix.spec.ts, from an earlier delivered task) declared its own local fixture typed against the widened type; it needed the same four default values added, with no assertion touched.
Two other pre-existing tests assert an exact DetailEvidenceItem shape without the new fields via untyped toEqual arguments -- these compile but will need their expected literals extended in the suite pass, since this task's widening legitimately extends what they claimed.
