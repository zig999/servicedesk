---
title: evidence-semantics-frontend, full review
summary: What the coverage, specification-conformance and standard-conformance passes found over all six delivered tasks of the evidence-semantics-frontend initiative; the failures pass did not run because the captured whole-change run passed clean.
reviewed:
- src/hooks/use-concept-form.ts
- src/hooks/use-concept-options.spec.ts
- src/hooks/use-concept-options.ts
- src/hooks/use-glossary-concepts.spec.ts
- src/hooks/use-glossary-concepts.ts
- src/hooks/use-simulate-case.ts
- src/hooks/use-simulate-hypothesis.ts
- src/routes/capability-form-fields-output-schema-guidance.spec.ts
- src/routes/capability-form-fields.tsx
- src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
- src/routes/case-simulation-cockpit-adapters.ts
- src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
- src/routes/case-simulation-detail-evidence-tab.tsx
- src/routes/case-simulation-detail-types.ts
- src/routes/concept-form-fields.tsx
- src/routes/glossary-browser-screen-concept-description.spec.ts
- src/routes/glossary-browser-screen-concept-form-accepts.spec.ts
- src/routes/glossary-browser-screen-concept-form-description.spec.ts
- src/routes/glossary-browser-screen-concept-form-save.spec.ts
- src/routes/glossary-browser-screen.test-support.ts
- src/routes/glossary-browser-screen.tsx
- src/routes/glossary-concepts-panel.tsx
- src/services/concept-form-schema.ts
- src/services/error-ui-state.spec.ts
- src/services/error-ui-state.ts
tasks:
- task/glossary-concept-description/concept-description-error-kind
- task/glossary-concept-description/browser-description-and-legacy-marker
- task/glossary-concept-description/concept-form-description-field
- task/capability-output-schema-guidance/output-schema-field-guidance
- task/simulation-evidence-snapshot/evidence-snapshot-wire-types
- task/simulation-evidence-snapshot/evidence-tab-snapshot-rendering
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/evidence-semantics-frontend) passed every step, so there was no failure to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
coverage:
- criterion: An ApiError whose code is ConceptDescriptionRequiredError maps to a named UiErrorState kind distinct from the generic failure kind.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConceptDescriptionRequiredError to its own distinct concept-description-required state, not the shared generic-error fallback
- criterion: The new table entry carries no user-facing wording.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConceptDescriptionRequiredError to a state carrying only the kind, no wording of its own
- criterion: Every ApiError code the table already names keeps mapping to its existing kind.
  state: covered
  tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseNotFoundError to the case-not-found state
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConnectorConfigurationNotWellFormedError to its own distinct state (and eighteen further pre-existing per-code tests in this same file, all untouched by this change)
- criterion: The concept shape use-glossary-concepts narrows carries description read from the concepts listing.
  state: covered
  tests:
  - file: src/hooks/use-glossary-concepts.spec.ts
    name: reads each concept's own description off the concepts listing verbatim, including an empty string for a legacy concept (criterion 1)
- criterion: The Concepts tab renders each concept's description.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-concept-description.spec.ts
    name: renders each concept's own description text in its own row
- criterion: A concept whose description is empty is rendered with a visible marker distinguishing it from described concepts.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-concept-description.spec.ts
    name: shows a described concept's own description as plain text and an empty-description concept as an 'Awaiting description' status-dot marker instead
- criterion: A concept whose description is empty renders no invented description text.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-concept-description.spec.ts
    name: renders the identical, fixed 'Awaiting description' marker for two differently-named concepts that share an empty description
- criterion: The sibling narrowing in use-concept-options continues to omit description, with the omission disclosed in its header comment as a deliberate departure from the sibling shape.
  state: partial
  tests:
  - file: src/hooks/use-concept-options.spec.ts
    name: type-checks that ConceptOption can never carry a description field, unlike its sibling GlossaryConcept (checked by this project's own typecheck step)
  why: The type-level omission is proven, but the criterion's own second clause — that the omission is disclosed in the hook's own header comment — is documentation content no test asserts; the proof record itself records this as untested.
- criterion: The concept form shows a description field populated with the concept's current description when editing.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-concept-form-description.spec.ts
    name: opens the Dialog with the Description field already holding that concept's own current description
- criterion: A submitted registration carries the description in the request body.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-concept-form-save.spec.ts
    name: issues PUT /v1/glossary/concepts/{name} at the typed name, closes the Dialog, and the Concepts tab shows the new concept afterward
  - file: src/routes/glossary-browser-screen-concept-form-save.spec.ts
    name: issues PUT /v1/glossary/concepts/{name} at the existing name with the edited accepts and ttl, and the Concepts tab shows the change afterward
  - file: src/routes/glossary-browser-screen-concept-form-accepts.spec.ts
    name: submits every checked subject type, in the order each was checked, when more than one is selected
  - file: src/routes/glossary-browser-screen-concept-form-accepts.spec.ts
    name: drops exactly the subject type that is unchecked, keeping the rest of an existing concept's own selection intact
- criterion: conceptFormSchema requires a non-empty description, with the mirroring of the backend DTO disclosed in the module's header comment.
  state: partial
  tests:
  - file: src/routes/glossary-browser-screen-concept-form-description.spec.ts
    name: blocks submission and issues no PUT when description is left empty, even though every other field is filled
  why: The client-side requirement itself is proven, but the criterion's own second clause — that the mirroring of the backend DTO is disclosed in the module's header comment — is documentation content no test asserts; the proof record itself records this as untested.
- criterion: A 422 ConceptDescriptionRequiredError response renders the screen's own wording for the missing description rather than the generic failure toast.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-concept-form-description.spec.ts
    name: shows the concept-description-required message rather than the generic fallback, and keeps the Dialog open
- criterion: A failure no criterion names still falls through to the existing generic toast.
  state: covered
  tests:
  - file: src/routes/glossary-browser-screen-concept-form-save.spec.ts
    name: shows the shared generic save-failure toast and keeps the Dialog open, since register-concept throws no domain error
- criterion: The capability form dialog shows guidance at the output_schema editor naming per-field type and description as what the platform reads.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: renders guidance beside the Output schema editor naming type and description as what the platform reads
- criterion: The routed capability detail screen shows the same guidance at its output_schema editor.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: renders the same guidance text beside the routed screen's own Output schema editor
- criterion: The guidance states that no other content of the JSON Schema is read or validated.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: renders guidance beside the Output schema editor naming type and description as what the platform reads
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: renders the same guidance text beside the routed screen's own Output schema editor
- criterion: The guidance states that a description says what a value means and never a decision.
  state: covered
  tests:
  - file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
    name: contrasts a meaning example against a decision example in the same paragraph
- criterion: JsonTextareaField's props and rendering are unchanged for its other consumers.
  state: uncovered
  why: No test asserts this; json-textarea-field.tsx is untouched (confirmed by reading the diff), but no test exercises any of the shared component's three other consumers (connector-configuration's field, the test-connector panel's sample input, this same form's input_schema field) to demonstrate no behavior changed for them.
- criterion: A valid output_schema whose properties declare no description still saves — the guidance enforces nothing.
  state: covered
  tests:
  - file: src/routes/capabilities-browser-screen-capability-form-schema.spec.ts
    name: persists JSON.stringify(JSON.parse(text)) for both schema fields, not the beautified display text (dispatches output_schema '{"kind":"TranslateTextOutput"}', no properties/description, and the create still succeeds)
  - file: src/routes/capability-detail-screen-save.spec.ts
    name: enables Save once output_schema is edited to a materially different value (UPDATED_OUTPUT_SCHEMA carries no properties/description either, and the save still succeeds)
- criterion: SimulateEvidenceItem in use-simulate-case declares fields and concept_description as optional wire fields.
  state: covered
  tests:
  - file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
    name: constructs without either field, proving neither is required (SimulateEvidenceItem)
  - file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
    name: constructs with both fields present, proving the declared shape accepts them (SimulateEvidenceItem)
- criterion: The evidence wire type in use-simulate-hypothesis declares the same two optional fields.
  state: covered
  tests:
  - file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
    name: constructs without either field, proving neither is required (Evidence)
  - file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
    name: constructs with both fields present, using its own independently-declared FieldSemantics
- criterion: toDetailEvidence carries both onto SimulationEvidenceItem in the Detail region's camelCase form.
  state: covered
  tests:
  - file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
    name: carries a present, non-empty snapshot through unchanged
  - file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
    name: carries a present but empty snapshot through unchanged, never inventing a value
  - file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
    name: leaves fields and conceptDescription absent, rather than coerced to a value, for a record carrying neither
- criterion: The render type declares the snapshot optional, with the absent reading for records collected before the snapshot existed stated at the read site.
  state: partial
  tests:
  - file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
    name: leaves fields and conceptDescription absent, rather than coerced to a value, for a record carrying neither
  why: That the render type's own two fields are optional and an absent value is never coerced is proven; that the absent reading is stated at the read site (a comment on the type declaration) is documentation content no test asserts.
- criterion: Existing fixture modules and specs constructing these shapes pass unchanged.
  state: covered
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab.spec.ts
    name: shows the result, the capability reference and the elapsed time for a collected concept with matching evidence (and every other pre-existing test in this file, none of which supplies fields/concept_description, all of which passed unmodified in the captured suite run)
  - file: src/routes/case-simulation-cockpit-adapters-evidence-capability-hotfix.spec.ts
    name: does not throw for a well-formed evidence item carrying only the flat capability_name/capability_version fields a real response actually sends
- criterion: An evidence item whose snapshot is present renders its concept_description with the item.
  state: covered
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
    name: renders the item's own concept_description alongside it
- criterion: The item renders each snapshotted field's name, and its type and description where the snapshot states them.
  state: covered
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
    name: renders a field's name, type and description together when the snapshot states all three
- criterion: A field lacking type or description renders without invented values.
  state: covered
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
    name: renders only the field's own name when the snapshot states neither type nor description, inventing neither
  - file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
    name: renders a field's own type without inventing a description when only type is stated
- criterion: An item whose concept_description is empty renders a stated absence of meaning, never invented text.
  state: covered
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
    name: renders the stated-absence sentence when concept_description is an empty string
- criterion: An item whose fields snapshot is empty renders a stated absence of field semantics and the tab still renders.
  state: covered
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
    name: renders the stated-absence sentence for an empty fields array, alongside the item's own other content
- criterion: A legacy response carrying no snapshot fields at all renders the tab as delivered today, without error.
  state: covered
  tests:
  - file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
    name: renders neither a concept_description line nor a field-semantics line when both are absent
- criterion: The semantics rendered are read only from the simulation response, with no glossary or capability-registry request issued to enrich them.
  state: uncovered
  why: No test asserts this; CaseSimulationDetailEvidenceTab issues no fetch or hook call of any kind (confirmed by reading the diff), so no test setup could observe a request that has nowhere to originate from.
---

## What it is
Coverage, specification-conformance and standard-conformance findings over the whole evidence-semantics-frontend change (all six tasks, twenty-four files), with the whole-change build/suite captured once and found clean.

## Notes
The whole-change build and suite were captured once, at run/evidence-semantics-frontend, and passed every step; the failures pass did not run and this record carries no `run` field, since that field holds only the run a failures-pass finding was read from.
The conformance and standard passes returned no findings; their own `read`/`in_scope` detail sits in the report handed back with this review, not in this record, per the contract's own instruction that a clean result belongs in the report for a person rather than in a stored list the root already determines from the standard's pin and the reviewed file set.
Three coverage entries are `partial` and two are `uncovered` — see the coverage array above for each one's own `why`; none is a defect this record judges, only an absence named so a reader can decide what it costs.
