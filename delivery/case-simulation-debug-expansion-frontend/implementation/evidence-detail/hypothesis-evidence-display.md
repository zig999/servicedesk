---
target: frontend
title: Per-hypothesis Evidence tab renders observed_at, ttl, inputs and capability
  payload notes
summary: CaseSimulationDetailEvidenceTab now presents each evidence item's observed_at,
  ttl, inputs and capability_payload_notes, reusing the existing pretty-print and
  status-dot conventions rather than duplicating them.
task: sha256:3c9c4d4335e367bd44acdd69369f7330a1a42ddb61c17abf43254c133dfaeeeb
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/evidence-detail-hypothesis-evidence-display-build
files:
- path: src/routes/case-simulation-detail-evidence-tab.tsx
  effect: renamed prettyPrintObservation to prettyPrintJson (shared by observation
    and inputs); added renderCapabilityPayloadNotes (renders nothing for an empty
    string); added observedAt ("UTC" suffix, raw string, no Date formatting) and ttl
    ("s" suffix) to the metadata row; added a capability-payload-notes line and a
    new collapsed <details>/<summary> "Inputs" block pretty-printing item.inputs with
    no masking transform
criteria:
- criterion: For each evidence item, the tab presents that item's observed_at as the
    UTC instant the item carries.
  met: true
  how: item.observedAt (an ISO-8601 UTC string) is rendered raw, suffixed " UTC",
    with no Date-object reformatting
- criterion: For each evidence item, the tab presents its ttl as a count of seconds
    read from that item's own observed_at.
  met: true
  how: item.ttl is rendered as "ttl {n}s", read directly off the item
- criterion: For each evidence item, the tab presents the inputs that collection was
    issued with.
  met: true
  how: item.inputs is rendered inside a new collapsed details "Inputs" block, pretty-printed
    via prettyPrintJson with a raw-string fallback
- criterion: For each evidence item, the tab presents the capability payload notes
    exactly as that item snapshotted them.
  met: true
  how: renderCapabilityPayloadNotes renders item.capabilityPayloadNotes verbatim when
    non-empty
- criterion: An item whose capability payload notes are empty is presented with no
    notes rather than with text drawn from anywhere else.
  met: true
  how: renderCapabilityPayloadNotes returns null for the empty string, rendering nothing
- criterion: The tab presents concept_description and field semantics from the item's
    own snapshot and issues no glossary or capability-registry read to enrich, refresh
    or substitute for it.
  met: true
  how: pre-existing renderConceptDescription/renderFieldSemantics read item.conceptDescription/item.fields
    directly with no fetch, unchanged; capabilityPayloadNotes follows the identical
    pattern
nodes:
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/routes/case-simulation-detail-evidence-tab.tsx
  how: the tab renders exactly the fields simulate-case/simulate-hypothesis already
    return per evidence item; no new operation, event or write is introduced
- node: domain/investigation/evidence
  encoded_at:
  - src/routes/case-simulation-detail-evidence-tab.tsx
  how: all four newly-rendered attributes are read directly off SimulationEvidenceItem
- node: rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked
  encoded_at:
  - src/routes/case-simulation-detail-evidence-tab.tsx
  how: not fully satisfiable from this component's available data -- DetailEvidenceItem
    carries inputs as an opaque string with no marker of a resolved credential value,
    and the backend's own evidence-collection code (serializeInputs) never embeds
    a connector-level credential value in Evidence.inputs at all. Rather than invent
    an unsanctioned detection heuristic, inputs is rendered unmasked, pretty-printed
    the same way observation already is
- node: rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
  encoded_at:
  - src/routes/case-simulation-detail-evidence-tab.tsx
  how: observedAt is rendered as the raw UTC string the item carries, suffixed "UTC",
    with no local-zone-converting formatter
- node: rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
  encoded_at:
  - src/routes/case-simulation-detail-evidence-tab.tsx
  how: ttl is rendered as a bare seconds count with no recomputation or unit conversion
- node: rules/investigation/presentation-reads-the-evidence-snapshot
  encoded_at:
  - src/routes/case-simulation-detail-evidence-tab.tsx
  how: concept_description, fields and capability_payload_notes are all read directly
    from the item prop; no glossary or capability-registry call exists in this component
inferences:
- inferred: observed_at is displayed as the raw ISO string suffixed with the literal
    text "UTC" rather than reformatted through a Date object.
  from: the rule's explicit warning against a local-zone reading, and the absence
    of any existing datetime-formatting helper in this file to reuse instead
- inferred: capability_payload_notes renders nothing (not a placeholder message) for
    an empty string, diverging from the sibling renderConceptDescription's placeholder
    convention.
  from: this task's own criterion explicitly forbidding substituted text for capability_payload_notes
    specifically
- inferred: inputs is rendered unmasked, with the try/parse/stringify-with-fallback
    convention generalized from prettyPrintObservation rather than any masking transform
    applied.
  from: no detection mechanism for a resolved-credential substring exists on DetailEvidenceItem
    or in the wire types; the backend's own serializeInputs for simulate-case/simulate-hypothesis
    never embeds a connector-level credential value in Evidence.inputs to begin with
preserved:
- Per-concept filtering (collects list intersected with evidence, one entry each,
  missing evidence entries omitted).
- The result-color status dot mapping.
- result_detail's conditional rendering.
- The Observation block's pretty-print-with-fallback behavior and its details/summary
  markup -- behavior preserved exactly; only the underlying helper's name changed.
- The judgment-call summary line and its called/not-called branching.
deferred:
- what: Actually masking a resolved credential value within a presented evidence item's
    inputs.
  why: no data reaching this frontend component marks which substring of inputs, if
    any, is a resolved credential value, and the current backend evidence-collection
    code never embeds a connector-level credential value in Evidence.inputs at all
    -- closing this gap is a backend evidence-recording concern or a specification
    clarification, not a frontend-rendering decision this task can make without inventing
    a mechanism nothing sanctions
---

## What it is
The Evidence tab of the Debug panel that opens when a hypothesis row is selected, now presenting the four attributes the response carried all along: observed_at, ttl, inputs and capability payload notes.

## Notes
The masking criterion could not be fully implemented: tracing the backend's own evidence-collection code shows Evidence.inputs never embeds a connector-level credential value at all, so there is nothing on the data this component receives to detect and mask. Recorded here rather than inventing an unsanctioned heuristic.
