---
title: Capability detail/edit route
summary: A dedicated route that shows and edits one capability in place of the popup dialog, reachable from the list and reversible.
rationale: Folds the scope's list-reachability, back-to-list, discard, and save-acknowledgement UX bullets into this one screen task for the same reason as the connector-configuration route — each is a facet of one falsifiable outcome, not independently useful on its own.
objective: A route at /capabilities/<name>/<version> shows the full capability, gates Save on isDirty, offers discard and a way back to the list, folds in the existing fields unchanged, and warns when a loaded schema is not valid JSON.
criteria:
  - Navigating to /capabilities/<name>/<version> for an existing capability shows that capability's full record, loaded through the new hook by both name and version.
  - Clicking a row on the capabilities list screen navigates to that capability's /capabilities/<name>/<version> route.
  - The route offers a control that returns the operator to the capabilities list.
  - The Save button is disabled until the form, including input_schema and output_schema, differs from its originally loaded values, and re-disables once every field is returned to that value.
  - A discard-changes control resets every field, including both JSON schema fields, back to the originally loaded values and re-disables Save.
  - The existing capability-form-fields.tsx markup is reused unchanged inside the new route.
  - A successful save shows a success acknowledgement and the screen visibly reflects the just-saved values.
  - If the loaded input_schema or output_schema value does not parse as valid JSON, the screen shows a plain warning that the stored value is invalid and must be corrected before Save can succeed, instead of rendering it silently.
  - Editing an existing capability from the list screen opens the new route instead of the popup dialog.
depends_on:
  - task/connector-capability-detail-editing/capability-detail-hook
  - task/connector-capability-detail-editing/json-textarea-pretty-print-on-load
sources:
  - intake/scope.md
implements:
  - domain/integration/capability
  - contracts/integration/capability-registry
  - rules/integration/a-capability-declares-well-formed-schemas
---

## What it is

This is the screen half of item 2: it consumes the new hook, reuses the existing fields unchanged, and adds the discard/save-acknowledgement/invalid-JSON-warning behavior the scope's UX section asks for.
The invalid-JSON warning criterion is what the previously reported "perfil-mobile-tecnico-reader" record exercises; this task's own concern is display of an already-invalid value, not its correction.
The popup dialog is left standing for creating a new capability; only the edit path for an existing record moves to this route.

## Notes

This task's schema-JSON criteria are not observably demonstrable against the live backend until the sibling backend plan's by-(name, version) read route (task/registry-reads/read-capability-by-identity-route) is delivered; the specification now publishes that operation (contracts/integration/capability-registry's read-capability-by-identity), but the backend task implementing it has not yet been delivered as of this task's own writing.
