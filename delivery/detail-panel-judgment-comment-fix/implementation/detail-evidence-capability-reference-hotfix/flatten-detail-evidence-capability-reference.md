---
title: Flatten the Detail evidence's capability reference to the wire's own two flat
  fields
summary: Corrects SimulateEvidenceItem, toDetailEvidence and the Evidence tab's capability/connector
  line to read capability_name/capability_version as flat fields, matching both simulate
  DTOs' real wire shape, instead of a nested capability object neither endpoint ever
  sends.
task: sha256:7fc6fcd7fa119f2f4405c2139a3940b36a8d3f68d9e10338e78e9b44fb5920d4
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/detail-evidence-capability-reference-hotfix-flatten-detail-evidence-capability-reference-build-2
files:
- path: src/hooks/use-simulate-case.ts
  effect: 'SimulateEvidenceItem now declares capability_name and capability_version
    as flat string fields (in that order, immediately before elapsed_ms, matching
    src/src/http/dto/simulate-case.dto.ts''s own evidenceSchema field-for-field),
    replacing the prior nested capability: { name, version } object no simulate response
    ever sent; the type''s own header comment is rewritten to state the flat shape
    and record this corrective fix.'
- path: src/routes/case-simulation-cockpit-adapters.ts
  effect: toDetailEvidence() now reads item.capability_name and item.capability_version
    (the wire type's own flat fields) instead of dereferencing item.capability.name/version,
    and builds the Detail region's own evidence item with flat capabilityName/capabilityVersion
    fields instead of a nested capability object; its own comment records the corrective
    fix and why the prior code crashed at render time on a real response.
- path: src/routes/case-simulation-detail-types.ts
  effect: 'SimulationEvidenceItem now carries capabilityName, capabilityVersion and
    connector as three flat fields (camelCase, matching this type''s own established
    normalization of the wire''s snake_case elsewhere) instead of a nested capability:
    SimulationCapabilityReference object; SimulationCapabilityReference is removed
    as no longer used anywhere in production source. The type''s own comment explains
    the flattening and records the corrective fix.'
- path: src/routes/case-simulation-detail-evidence-tab.tsx
  effect: The capability/connector line now renders item.capabilityName, item.capabilityVersion
    and item.connector -- three flat properties of the evidence item -- instead of
    item.capability.name/item.capability.version/item.capability.connector; the component's
    own header comment records the corrective fix and why the prior line crashed on
    a real response.
criteria:
- criterion: Opening the Detail panel for an evaluation produced by POST /v1/simulate/hypothesis
    does not throw or show "Something went wrong" for a well-formed response.
  met: true
  how: use-case-simulation-cockpit.ts's own evidence field is only ever built by toDetailEvidence()
    when the selected evaluation's source is "case" (a full-case run); a hypothesis-sourced
    evaluation always renders with an empty evidence array, so this path never dereferences
    a capability reference at all and cannot throw from it, before or after this fix.
- criterion: Opening the Detail panel for an evaluation produced by POST /v1/simulate
    does not throw or show "Something went wrong" for a well-formed response.
  met: true
  how: toDetailEvidence() (case-simulation-cockpit-adapters.ts) now reads item.capability_name/item.capability_version,
    the two flat fields src/src/http/dto/simulate-case.dto.ts's own evidenceSchema
    actually sends, instead of dereferencing a nested item.capability.name/item.capability.version
    that property never existed on a real response -- the exact dereference that threw
    "Cannot read properties of undefined (reading 'name')" before this fix.
- criterion: The Evidence tab's capability/connector line reads capability_name and
    capability_version as flat fields of the evidence item, never as a nested capability
    object.
  met: true
  how: case-simulation-detail-evidence-tab.tsx's render line now reads item.capabilityName
    and item.capabilityVersion directly off the evidence item (case-simulation-detail-types.ts's
    own SimulationEvidenceItem, itself flattened to carry them as two flat fields
    alongside connector) instead of item.capability.name/item.capability.version.
- criterion: SimulateEvidenceItem (frontend/app/src/hooks/use-simulate-case.ts) declares
    capability_name and capability_version as flat string fields, matching src/src/http/dto/simulate-case.dto.ts's
    own evidenceSchema, instead of a nested capability object.
  met: true
  how: 'SimulateEvidenceItem now declares capability_name: string and capability_version:
    string as flat fields, in the same position evidenceSchema declares them (immediately
    before elapsed_ms), replacing the prior nested capability: { name: string; version:
    string }.'
nodes:
- node: domain/investigation/evidence
  encoded_at:
  - src/hooks/use-simulate-case.ts
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-cockpit-adapters.ts
  - src/routes/case-simulation-detail-evidence-tab.tsx
  how: Corrects how the capability reference this node's own relationships section
    pins (target domain/integration/capability, cardinality exactly one) is carried
    and read across every layer this evidence record passes through -- the wire-facing
    type, the adapter that translates it, the Detail region's own narrowed type, and
    the render site -- from a nested shape no simulate response ever sends to the
    two flat fields it actually does.
- node: domain/integration/capability
  encoded_at:
  - src/hooks/use-simulate-case.ts
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-cockpit-adapters.ts
  - src/routes/case-simulation-detail-evidence-tab.tsx
  how: The reference evidence carries this aggregate by its own two identifying attributes,
    name and version -- unchanged as a domain fact by this fix, only corrected in
    how those two identifying values are actually read and rendered (flat fields,
    not a nested sub-object).
inferences:
- inferred: The Detail region's own SimulationEvidenceItem (case-simulation-detail-types.ts)
    carries the flattened reference as camelCase capabilityName/capabilityVersion
    (plus a flat connector field), rather than literally spelling them capability_name/capability_version
    at that type.
  from: This file's own already-established convention of normalizing the wire's snake_case
    into camelCase at exactly this boundary (result_detail/elapsed_ms already become
    resultDetail/elapsedMs on this same type, and SimulationUsage already normalizes
    input_tokens/output_tokens into inputTokens/outputTokens) -- criterion 3 states
    the render site's behavior (flat fields, never nested) without naming an exact
    field spelling for this downstream type, while criterion 4's literal capability_name/capability_version
    spelling is explicitly tied to a different, wire-facing type (SimulateEvidenceItem
    in use-simulate-case.ts), which this fix does spell exactly that way.
preserved:
- toDetailEvidence()'s existing behavior of being called only with a full-case run's
  own evidence array, and of reading concept/result/result_detail/elapsed_ms/observation/origin
  unchanged.
- The Evidence tab's per-collected-concept selection, its evidence-result color mapping,
  its observation JSON pretty-printing, and its judgment-call summary line -- none
  of which this fix touches.
- use-simulate-hypothesis.ts's own Evidence type and dispatch logic, which already
  declared capability_name/capability_version flat and correctly, and is untouched
  by this fix.
- The rest of use-simulate-case.ts's SimulateCaseResult shape (evaluations, assessment,
  cost, durations) and every other adapter in case-simulation-cockpit-adapters.ts,
  none of which reads a capability reference.
deferred:
- what: 'use-case-simulation-cockpit.ts''s own detail.evidence field is built as selectedEvaluation.source
    === "case" && lastCaseResult ? toDetailEvidence(lastCaseResult.evidence) : []
    -- a hypothesis-sourced evaluation''s own SimulateHypothesisResult.evidence (which
    does carry a real evidence array, per use-simulate-hypothesis.ts''s own SimulateHypothesisResult
    type) is never passed into the Detail panel, so the Evidence tab always shows
    "No evidence collected for this hypothesis" for a single-hypothesis run rather
    than the run''s own real evidence.'
  why: This task's own file set and criteria name only use-simulate-case.ts, case-simulation-cockpit-adapters.ts
    and case-simulation-detail-evidence-tab.tsx -- wiring a hypothesis-sourced run's
    own evidence through the Detail panel touches a fourth file (use-case-simulation-cockpit.ts)
    and a fifth type's own adapter path (use-simulate-hypothesis.ts's Evidence ->
    a toDetailEvidence-equivalent for it), neither of which this corrective task names,
    and reaches past "flatten the capability reference" into a distinct gap in what
    the Detail region renders for that endpoint.
- what: 'case-simulation-cockpit-adapters.ts''s own comment above toDetailEvidence
    still states "use-simulate-hypothesis.ts''s own SimulateHypothesisResult carries
    none at all" (evidence) -- that statement is stale; SimulateHypothesisResult does
    declare an evidence: readonly Evidence[] field.'
  why: Correcting that comment's factual claim is tied to the same deferred wiring
    gap above rather than to this task's own capability-flattening fix, and editing
    it in isolation here would misstate that the gap was closed when it was not.
---

## What it is

The corrective implementation fixing the Detail panel's crash on a real simulation run by
reading evidence's capability reference as the two flat fields (`capability_name`,
`capability_version`) both simulate DTOs actually send, at every layer this reference passes
through -- the wire-facing type, the adapter, the Detail region's own type, and the render site --
in place of a nested `capability: { name, version }` object neither endpoint has ever sent.

## Notes

None.
