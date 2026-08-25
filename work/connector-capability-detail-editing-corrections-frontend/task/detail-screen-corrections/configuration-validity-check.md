---
title: Reject non-object JSON in the connector-configuration validity check
summary: use-connector-configuration-detail.ts's configurationValid derivation rejects a syntactically valid JSON value that is not an object.
sources:
  - intake/scope.md
objective: use-connector-configuration-detail.ts's configurationValid derivation rejects a syntactically valid JSON value that is not an object, so the object requirement rules/integration/a-connector-configuration-holds-a-well-formed-object already states is what gates the warning banner and the Save-disable it feeds.
criteria:
  - "A configuration text that parses as valid JSON but is not an object (an array, a bare string, a number, true, or null) sets configurationValid to false in use-connector-configuration-detail.ts, where it previously read true."
  - "A configuration text that parses as a JSON object continues to set configurationValid to true."
  - "The Save button in connector-configuration-form-fields.tsx is disabled when configurationValid is false for a non-object parsed value, with no code change to connector-configuration-form-fields.tsx itself."
  - "The warning banner in connector-configuration-detail-ready-view.tsx appears when configurationValid is false for a non-object parsed value, with no code change to connector-configuration-detail-ready-view.tsx itself."
  - "use-capability-detail.ts's inputSchemaValid and outputSchemaValid derivation, and json-textarea-field.tsx's parseJsonText/getJsonTextareaMinifiedValue, are unchanged."
implements:
  - rules/integration/a-connector-configuration-holds-a-well-formed-object
---

## What it is

The fix to use-connector-configuration-detail.ts's configurationValid derivation, adding an object check on top of the existing parse-only check.
The fix is scoped to this one hook's validity-flag derivation, not to the shared getJsonTextareaMinifiedValue function or the capability-side hook, per the inventory's must_not_duplicate and risk notes.

## Notes

None.
