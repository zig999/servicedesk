---
title: Test-connector debug panel on the Connector Configuration editor
summary: A debug-style Test section on the connector configuration editor that exercises it once, through a chosen registered capability, and shows the raw request and response.
rationale: The scope places the Test section inside the Connector Configuration editor rather than as a standalone screen; this task is cut apart from that editor's own create/edit task because issuing a live diagnostic call and rendering raw transport detail is a distinct falsifiable outcome from persisting a configuration, even though it is reached from the same screen.
sources:
  - work/capability-connector-authoring-frontend/intake/scope.md
objective: From the Connector Configuration editor, an operator can exercise a connector configuration's call once, through a specific registered capability that names it, and see the full technical detail of the request and response or the raw failure.
criteria:
  - The Test section's capability picker offers only capabilities currently registered with this connector configuration's name as their connector.
  - The Test section lets the operator pick a subject type and type that subject's attribute-values directly, with no list of existing subjects offered to select from.
  - The sample input field is edited through the shared JSON beautify/minify textarea, scoped to the chosen capability's own input_schema.
  - "Clicking \"Test\" issues the call and displays the request actually sent: method, resolved address, headers and body."
  - "A completed call displays the response actually received: status, headers, body and elapsed time."
  - A failed or timed-out call displays the raw error or timeout rather than a parsed or summarized result.
  - Nothing the Test section displays is persisted as evidence or reachable from any investigation screen.
depends_on:
  - task/capability-authoring/json-textarea-editor
  - task/connector-configuration-authoring/connector-configuration-create-edit-form
implements:
  - domain/integration/connector-configuration
  - rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  - contracts/integration/connector-diagnostics
---

## What it is

A debug-style Test section on the Connector Configuration editor: pick a registered capability naming this connector, assemble a subject by hand, edit a sample input against that capability's input_schema, and see the raw request sent and raw response received.

## Notes

REMAINDER, from the specification — rules/integration/a-connector-configuration-holds-a-well-formed-object states an invariant over registering or updating a connector configuration's own configuration text. Nothing in this task's objective or criteria concerns registering or editing that text — the Test section's sample-input textarea is scoped to the chosen capability's input_schema, a different field entirely. This rule's statement reaches no criterion of this task; it belongs to task/connector-configuration-authoring/connector-configuration-create-edit-form, which implements it.
