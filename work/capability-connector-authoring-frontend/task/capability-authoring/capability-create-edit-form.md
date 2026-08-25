---
title: Capability create and edit form on the capabilities browser screen
summary: Replaces the capabilities browser screen's read-only detail panel with a create/edit form covering a capability's full declared contract.
rationale: The scope describes the list augmentation (New/Edit actions) and the editor form as one change to one screen; this task keeps them together because the actions have nothing to demonstrate without the form they open, and the form has no route into the existing screen without them.
sources:
  - work/capability-connector-authoring-frontend/intake/scope.md
objective: An operator can create a new capability and edit an existing one, including both JSON schemas, from the capabilities browser screen.
criteria:
  - The capabilities browser screen offers a "New capability" action that opens a form for name, version, nature, input_schema, output_schema, timeout, connector and concept.
  - Each row in the capabilities browser screen offers an "Edit" action that opens the same form pre-filled with that row's current values, replacing the existing read-only detail panel.
  - input_schema and output_schema are edited through the shared JSON beautify/minify textarea, and the value persisted on save is the minified JSON.
  - The concept field selects exactly one existing concept; the form provides no way to associate a capability with more than one concept at once.
  - "Submitting the form with a non-read-only nature does not fail silently: the registry's refusal reaches the operator as a visible, specific message rather than a generic or absent one."
  - A successful create or edit persists the capability's declared contract and the browser screen reflects the change afterward.
depends_on:
  - task/capability-authoring/json-textarea-editor
implements:
  - domain/integration/capability
  - domain/integration/capability-nature
  - domain/integration/capability-registry
  - rules/integration/a-capability-declares-its-contract
  - rules/integration/a-capability-is-read-only
  - rules/integration/one-capability-answers-one-concept
  - rules/integration/a-capability-declares-well-formed-schemas
  - contracts/integration/capability-registry
---

## What it is

Create and edit for a capability's full declared contract — name, version, nature, both JSON schemas, timeout, connector and concept — replacing the capabilities browser screen's read-only detail panel.

## Notes

None.
