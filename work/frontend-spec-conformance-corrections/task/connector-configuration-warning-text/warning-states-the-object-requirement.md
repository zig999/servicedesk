---
title: Connector configuration warning states the object requirement, not a JSON-syntax claim
summary: INVALID_CONFIGURATION_WARNING in connector-configuration-detail-ready-view.tsx states what the registry actually requires — a JSON object — instead of claiming the stored value is not valid JSON, which is false whenever the value is a syntactically valid array or null.
objective: A curator shown the invalid-configuration warning is told the truth for every case state.configuration.isValid can be false — unparsable text, a syntactically valid JSON array, or a syntactically valid JSON null — and is pointed at the actual correction (the value must be an object).
criteria:
  - The warning text no longer states or implies that the stored value "is not valid JSON" as the general reason it is invalid.
  - Given the stored value is syntactically valid JSON but an array, the warning shown does not claim the value is not valid JSON, and states the value must be an object.
  - Given the stored value is syntactically valid JSON but null, the warning shown does not claim the value is not valid JSON, and states the value must be an object.
  - Given the stored value is text that does not parse as JSON at all, the warning shown remains accurate and still blocks Save.
  - isValidConfigurationObject in use-connector-configuration-detail.ts, and what it gates, is unchanged — only the warning's own text changes.
implements:
  - rules/integration/a-connector-configuration-holds-a-well-formed-object
rationale: A corrective increment answering to no criterion any task holds — the divergence was found by siegard-reconcile/frontend-connector-configuration-detail-drift.md's judgment over connector-configuration-detail-ready-view.tsx, reconciling delivered code against the specification rather than any task's own criteria. rules/integration/a-connector-configuration-holds-a-well-formed-object distinguishes unparsable text from syntactically-valid-but-non-object text; the warning's wording did not.
sources:
  - intake/2026-08-27-connector-configuration-warning-text.md
---

## What it is

A corrective increment: one warning message's wording, found false for a case the specification's own rule distinguishes, corrected to state the real requirement rather than a narrower JSON-syntax claim.

## Notes

None.
