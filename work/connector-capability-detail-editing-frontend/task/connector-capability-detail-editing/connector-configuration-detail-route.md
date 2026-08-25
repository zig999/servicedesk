---
title: Connector configuration detail/edit route
summary: A dedicated route that shows and edits one connector configuration in place of the popup dialog, reachable from the list and reversible.
rationale: Folds the scope's list-reachability, back-to-list, discard, and save-acknowledgement UX bullets into this one screen task rather than separate tasks, because each is a facet of the same falsifiable outcome — an operator can view, reach, and edit one connector configuration on its own route — and none of them is independently useful without the route existing.
objective: A route at /connectors/<connector> shows the full connector configuration, gates Save on isDirty, offers discard and a way back to the list, folds in the existing fields and ConnectorTestPanel unchanged, and warns when the loaded configuration is not valid JSON.
criteria:
  - Navigating to /connectors/<connector> for an existing connector shows that connector configuration's full record, loaded through the new hook.
  - Clicking a row on the connector-configurations list screen navigates to that connector's /connectors/<connector> route.
  - The route offers a control that returns the operator to the connector-configurations list.
  - The Save button is disabled until the form, including configuration, differs from its originally loaded values, and re-disables once every field is returned to that value.
  - A discard-changes control resets every field, including configuration, back to the originally loaded values and re-disables Save.
  - The existing connector-configuration-form-fields.tsx markup and the existing ConnectorTestPanel are reused unchanged inside the new route.
  - A successful save shows a success acknowledgement and the screen visibly reflects the just-saved values.
  - If the loaded configuration value does not parse as valid JSON, the screen shows a plain warning that the stored value is invalid and must be corrected before Save can succeed, instead of rendering it silently.
  - Editing an existing connector configuration from the list screen opens the new route instead of the popup dialog.
depends_on:
  - task/connector-capability-detail-editing/connector-configuration-detail-hook
  - task/connector-capability-detail-editing/json-textarea-pretty-print-on-load
sources:
  - intake/scope.md
implements:
  - domain/integration/connector-configuration
  - contracts/integration/connector-configuration-registry
  - rules/integration/a-connector-configuration-holds-a-well-formed-object
---

## What it is

This is the screen half of item 1: it consumes the new hook, reuses the existing fields and test panel unchanged, and adds the discard/save-acknowledgement/invalid-JSON-warning behavior the scope's UX section asks for.
The popup dialog is left standing for creating a new connector configuration; only the edit path for an existing record moves to this route.

## Notes

This task's configuration-JSON criteria (pretty-print, invalid-JSON warning, dirty comparison) are not observably demonstrable against the live backend until the sibling backend plan's fix lands, since the backend currently answers configuration as an object rather than the string this screen expects.
REMAINDER, from the specification — rules/integration/a-capability-declares-well-formed-schemas governs a capability's input_schema and output_schema, never connector-configuration's configuration field; this task names only connector configuration. That clause belongs to task/connector-capability-detail-editing/capability-detail-route, whose own invalid-JSON criterion is the mirror of this task's on the capability side.
