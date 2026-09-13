---
target: frontend
title: Fixed pt-BR configuration entry guidance beside the Configuration field
summary: Adds a standing, ungated pt-BR guidance list beside the connector-configuration form's
  Configuration textarea, stating the four facts the governing rule bounds it to and nothing else.
task: sha256:c8ec152255e6d2047a6edd23c2cd57e0156da3ccc23b78c095696be7284a6bea
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/configuration-readiness-configuration-entry-guidance-build
files:
- path: src/services/connector-configuration-messages.ts
  effect: Adds four new pt-BR message constants -- CONFIGURATION_ENTRY_GUIDANCE_IS_JSON_OBJECT_MESSAGE,
    CONFIGURATION_ENTRY_GUIDANCE_READS_KEYS_MESSAGE, CONFIGURATION_ENTRY_GUIDANCE_READS_CALL_PARTS_MESSAGE,
    CONFIGURATION_ENTRY_GUIDANCE_PLACEHOLDER_FORMS_MESSAGE -- following the file's existing convention
    of exported UPPER_SNAKE_CASE string constants holding pt-BR literal text.
- path: src/routes/connector-configuration-form-fields.tsx
  effect: Imports the four new message constants, adds a local CONFIGURATION_ENTRY_GUIDANCE_MESSAGES
    array composing them in order, adds a small ConfigurationEntryGuidance() component rendering
    them as a <ul> of <li> items styled text-sm text-muted-foreground, and renders
    <ConfigurationEntryGuidance /> immediately below the existing <JsonTextareaField id="configuration" />
    call, unconditionally.
criteria:
- criterion: The entry states that what is entered is a JSON object.
  met: true
  how: CONFIGURATION_ENTRY_GUIDANCE_IS_JSON_OBJECT_MESSAGE ("O que e digitado aqui e um objeto
    JSON.") is always rendered as the first list item.
- criterion: The entry states that the HTTP connector reads a configuration's method, address,
    statusMap and responseMap.
  met: true
  how: CONFIGURATION_ENTRY_GUIDANCE_READS_KEYS_MESSAGE is always rendered as the second list item.
- criterion: The entry states that the HTTP connector reads a query, headers and a body where the
    configuration declares them.
  met: true
  how: CONFIGURATION_ENTRY_GUIDANCE_READS_CALL_PARTS_MESSAGE is always rendered as the third list
    item.
- criterion: 'The entry states that a placeholder is written as ${subject:<attribute-name>},
    ${requester} or ${credential:<name>}.'
  met: true
  how: CONFIGURATION_ENTRY_GUIDANCE_PLACEHOLDER_FORMS_MESSAGE is always rendered as the fourth
    list item, keeping the placeholder syntax literal exactly as the governing rule states it.
- criterion: The entry states no claim about a connector configuration beyond those four.
  met: true
  how: ConfigurationEntryGuidance renders exactly the four messages above and nothing else -- no
    heading, no intro prose, no worked example, no mention of the sibling readiness statements.
- criterion: The entry refuses nothing and withholds no act.
  met: true
  how: ConfigurationEntryGuidance takes no props and reads no state -- it is not conditioned on
    configuration.isValid, isSubmitting, isDirty or any other value, and its presence in the JSX
    tree does not touch isSaveDisabled or any Button's disabled prop.
nodes:
- node: rules/integration/a-connector-configuration-entry-states-what-the-http-connector-reads-from-it
  encoded_at:
  - src/services/connector-configuration-messages.ts
  - src/routes/connector-configuration-form-fields.tsx
  how: The four exported message constants restate exactly the rule's four bounded claims and add
    no worked example and no fifth claim, per the rule's own Description.
- node: domain/integration/connector-configuration
  encoded_at:
  - src/services/connector-configuration-messages.ts
  how: Honored only insofar as the entry names the keys and placeholder forms this domain concept
    already fixes; the task adds no new fact about the domain concept itself.
inferences:
- inferred: Placement immediately below the JsonTextareaField call.
  from: The task's own suggestion left the exact placement to this delivery's judgment; below was
    chosen so the guidance reads as a caption to the field the operator just saw.
- inferred: Rendered as an unordered list styled text-sm text-muted-foreground, rather than a
    single paragraph or four separate <p> elements.
  from: The existing KeyChangeList and ApplyConfirmationDiffBody components in this same file
    already use this exact list styling for multi-item guidance/diff text beside form fields.
- inferred: 'The placeholder forms (${subject:<attribute-name>}, ${requester}, ${credential:<name>})
    are kept in their literal English-syntax form rather than translated.'
  from: a-connector-configuration-placeholder-is-written-in-one-of-three-forms states these as
    literal text forms the configuration's own JSON must contain verbatim.
preserved:
- The Configuration Helper's own sections, the draft-request gate, the apply-confirmation
  diff/dialog, the stale-draft marking, and the Save button's existing isSaveDisabled gating --
  none of these were touched; the new guidance component reads no props from the form and calls
  no handler.
deferred:
- what: The four sibling readiness statements this same epic adds (HTTP-connector departures,
    subject placeholders, credential placeholders, responseMap coverage).
  why: Those are judgment-based statements over the field's current content; this task's guidance
    is fixed, standing text that does not change based on what the operator typed. Belongs to the
    sibling tasks of this epic.
---

## What it is
The fixed guidance line beside the Configuration textarea.

## Notes
Build round 1 green on the first attempt.
