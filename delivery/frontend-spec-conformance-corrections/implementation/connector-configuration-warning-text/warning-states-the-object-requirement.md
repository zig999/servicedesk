---
title: Connector configuration warning states the object requirement, not a JSON-syntax claim
summary: Corrected INVALID_CONFIGURATION_WARNING in connector-configuration-detail-ready-view.tsx to state
  the registry's actual requirement (the stored value must be a JSON object) instead of the false-in-two-cases
  'is not valid JSON' claim.
task: sha256:74483cbc8375d0a485fb9061e911ff14a616bf3222844ab38da7775780a57fcc
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-configuration-warning-text-warning-states-the-object-requirement-build
files:
- path: src/routes/connector-configuration-detail-ready-view.tsx
  effect: the INVALID_CONFIGURATION_WARNING constant now reads 'This connector configuration's stored
    value must be a JSON object. Correct it before Save can succeed.' instead of 'This connector configuration's
    stored value is not valid JSON. Correct it before Save can succeed.'; no other line in the file changed
criteria:
- criterion: The warning text no longer states or implies that the stored value "is not valid JSON" as
    the general reason it is invalid.
  met: true
  how: The new text makes no claim about JSON syntax at all; it states the value must be a JSON object.
- criterion: Given the stored value is syntactically valid JSON but an array, the warning shown does not
    claim the value is not valid JSON, and states the value must be an object.
  met: true
  how: An array is syntactically valid JSON but is not an object, so 'must be a JSON object' is true for
    this case and makes no syntax claim.
- criterion: Given the stored value is syntactically valid JSON but null, the warning shown does not claim
    the value is not valid JSON, and states the value must be an object.
  met: true
  how: null is syntactically valid JSON but is not an object (isValidConfigurationObject's own parsed
    !== null check confirms this), so 'must be a JSON object' is true for this case too.
- criterion: Given the stored value is text that does not parse as JSON at all, the warning shown remains
    accurate and still blocks Save.
  met: true
  how: Unparsable text is also not a JSON object, so the same sentence stays true for this case; the render
    condition (!state.configuration.isValid) and everything gating Save were not touched, so blocking
    behavior is unchanged.
- criterion: isValidConfigurationObject in use-connector-configuration-detail.ts, and what it gates, is
    unchanged — only the warning's own text changes.
  met: true
  how: That file was not opened for writing and no edit was made to it; only the INVALID_CONFIGURATION_WARNING
    string literal in connector-configuration-detail-ready-view.tsx was changed.
nodes:
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  how: The rule distinguishes unparsable text from syntactically-valid-but-non-object text (null and array
    included) as two different kinds of not-well-formed, both refused because the registry requires an
    object. The corrected warning states that actual requirement — the value must be a JSON object — which
    is simultaneously true for all three failure shapes isValid collapses into one boolean, rather than
    the prior text's narrower and sometimes-false claim that the value fails JSON syntax.
  encoded_at:
  - src/routes/connector-configuration-detail-ready-view.tsx
preserved:
- isValidConfigurationObject's three-case classification (unparsable text, array, null) in use-connector-configuration-detail.ts,
  left untouched.
- The warning's render condition (!state.configuration.isValid), placement above ConnectorConfigurationFormFields,
  role="alert", and styling — all unchanged.
- 'Everything else in connector-configuration-detail-ready-view.tsx: the discard-confirmation dialog,
  the header comment block, DISCARD_DIALOG_DESCRIPTION, and all other markup.'
---

## What it is

A corrective increment: one warning message's wording, found false for two of the three cases
that trigger it, corrected to state the registry's real requirement (a JSON object) instead of a
narrower, sometimes-false JSON-syntax claim.

## Notes

None.
