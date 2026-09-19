---
target: frontend
title: Case result Debug JSON tab, with resolved-credential masking
summary: A new JSON tab on the Case result Debug block renders the shown run's whole
  simulate-case payload, masking any resolved credential value found inside an evidence
  item's inputs with the fixed text ***REDACTED*** before stringifying.
task: sha256:0205a5c8269e27e34c02e119d04ccec643dfe4f9d948c9f2105beff084b81c9c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-run-record-raw-payload-build
files:
- path: src/routes/case-simulation-case-result-json-tab.tsx
  effect: new file. Exports CaseSimulationCaseResultJsonTab, which JSON.stringifies
    (null, 2) a masked copy of the rawResponse prop inside the same pretty-printed
    convention the per-hypothesis JSON tab uses. Private helpers walk rawResponse.evidence
    structurally and redact any resolved credential placeholder in an item's inputs
    string with the fixed text ***REDACTED***, leaving every other field/value untouched
- path: src/routes/case-simulation-case-result-panel.tsx
  effect: added a third TabsTrigger/TabsContent (JSON, after Prompt and Totals) rendering
    CaseSimulationCaseResultJsonTab with rawResponse={shownRun.rawResponse}
criteria:
- criterion: The block presents a raw JSON view of the shown run's returned payload.
  met: true
  how: the new JSON TabsContent renders CaseSimulationCaseResultJsonTab, which JSON.stringifies
    the masked rawResponse inside a pre element
- criterion: That view carries the run's evidence, its evaluations, its assessment,
    its cost and its durations in one payload.
  met: true
  how: rawResponse is the whole SimulateCaseResult object stored unmodified; the masking
    transform only replaces the evidence key's value and spreads every other key through
- criterion: Apart from the masking of a resolved credential value inside an evidence
    item's inputs, the payload is presented as received, with no field dropped and
    none renamed.
  met: true
  how: 'the transform returns {...rawResponse, evidence: ...}, so every other key
    is the same reference; within evidence, each item is spread with only inputs overwritten'
- criterion: Whatever value a credential placeholder resolved to within a presented
    evidence item's inputs is shown as the fixed text ***REDACTED***.
  met: true
  how: redactResolvedCredentialValue replaces every match of the credential-placeholder
    pattern in an item's inputs string with the literal ***REDACTED***
- criterion: The field that held the masked value is still present in the presented
    inputs, and no other value in the payload is altered by the masking.
  met: true
  how: masking is a string replace on the inputs field's own value, never a deletion;
    the rest of the item and payload are spread unchanged
- criterion: An evidence item's inputs that hold no resolved credential value are
    presented exactly as recorded.
  met: true
  how: replace() with no pattern match returns the string's content unchanged
- criterion: The payload presented is the shown run's own, so selecting an earlier
    run in the session history presents that run's payload.
  met: true
  how: the JSON tab is wired to shownRun.rawResponse, the same shownRun every other
    part of the panel already reads, swapped by the existing Show button mechanism
nodes:
- node: contracts/investigation/case-simulation
  encoded_at:
  - src/routes/case-simulation-case-result-json-tab.tsx
  - src/routes/case-simulation-case-result-panel.tsx
  how: the JSON tab is the case-level counterpart of the per-hypothesis JSON tab,
    now surfacing simulate-case's whole returned record
- node: rules/investigation/a-simulation-session-retains-its-runs-and-shows-one
  encoded_at:
  - src/routes/case-simulation-case-result-panel.tsx
  how: bound only for the shows-one-run's-own-record half; the JSON tab reads shownRun.rawResponse
- node: rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked
  encoded_at:
  - src/routes/case-simulation-case-result-json-tab.tsx
  how: masks every occurrence of a credential placeholder's textual form inside an
    evidence item's inputs string with the fixed literal ***REDACTED***, implemented
    as a best-effort pure transform since the current backend never actually embeds
    such a value
- node: rules/investigation/a-presented-consolidation-prompt-is-shown-whole
  encoded_at:
  - src/routes/case-simulation-case-result-json-tab.tsx
  how: the masking touches only evidence[].inputs; assessment.prompt passes through
    unmodified
- node: domain/investigation/assessment
  encoded_at:
  - src/routes/case-simulation-case-result-json-tab.tsx
  how: carried whole and unmodified inside the JSON tab's rendered payload
- node: domain/investigation/cost
  encoded_at:
  - src/routes/case-simulation-case-result-json-tab.tsx
  how: carried whole and unmodified
- node: domain/investigation/durations
  encoded_at:
  - src/routes/case-simulation-case-result-json-tab.tsx
  how: carried whole and unmodified
inferences:
- inferred: The masking heuristic looks for the literal credential-placeholder textual
    form ${credential:<name>} inside an evidence item's inputs string.
  from: this task's own Notes directing a best-effort function, combined with the
    only specification-anchored textual marker this codebase has for a credential
    reference
- inferred: The masking transform returns its input unchanged whenever it does not
    structurally match the expected shape, rather than throwing or coercing.
  from: CaseResultRun.rawResponse is deliberately typed unknown; narrowing it back
    with an assertion is forbidden without an accompanying guard
- inferred: The redaction helpers are kept as private, unexported module-scope functions
    beside the component that uses them.
  from: the inventory's existing precedent (prettyPrintJson) and its reservation of
    case-simulation-cockpit-adapters.ts for wire-to-UI renaming adapters alone
- inferred: The new JSON tab is placed last, after Prompt and Totals.
  from: the per-hypothesis Debug's own Evidence/Prompt/JSON ordering, named as the
    direct template this mirrors
preserved:
- The existing Prompt and Totals tabs and their components, unmodified.
- The shownRun/shownRunId selection mechanism, the compare-selection controls, and
  the Runs this session list, all unmodified.
- CaseResultRun, NewCaseResultRun and every existing adapter in case-simulation-cockpit-adapters.ts,
  untouched.
- The per-hypothesis Debug's own JSON tab, untouched.
---

## What it is
The case-level counterpart of the per-hypothesis Debug's JSON tab, showing the whole record the contract says simulate-case returns for the shown run, with the one exception the specification requires -- a resolved credential value inside an evidence item's inputs, masked.

## Notes
The masking function is best-effort against a case that, per an earlier sibling task's own finding, the current backend never actually produces (Evidence.inputs never embeds a resolved credential value) -- implemented anyway because the specification requires the capability to exist, not because current data exercises it.
