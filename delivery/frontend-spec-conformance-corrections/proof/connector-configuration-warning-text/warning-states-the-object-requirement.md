---
title: Connector-configuration warning states the object requirement, not a JSON-syntax claim
summary: Extends connector-configuration-detail-screen.spec.ts (and its shared test-support fixtures)
  to prove the corrected INVALID_CONFIGURATION_WARNING text and Save-blocking hold across all three isValid=false
  shapes — unparsable text, a syntactically valid array, and syntactically valid null — and that the underlying
  validity gate is unchanged.
implementation: sha256:a856c412a45bb678ab9c982672f2bee3f9a477b08d20ffde7321e8a2055725bd
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-configuration-warning-text-warning-states-the-object-requirement-suite
tests:
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: an invalid loaded configuration is warned about (criterion 8) > shows the plain warning, stating
    the value must be a JSON object, when the loaded value does not parse as JSON at all (corrective criterion
    1)
  proves: Criterion 1 (no longer states/implies 'is not valid JSON') for the unparsable-text case, and
    the general presence of the corrected wording at load time.
  fails_when: The rendered warning text is anything other than the exact corrected sentence — including
    if the old 'is not valid JSON' wording were restored, or the string changed to anything else.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: an invalid loaded configuration is warned about (criterion 8) > shows no such warning while the
    loaded configuration is valid JSON
  proves: The corrected warning still gates on isValid — no regression to always-on or always-off from
    the wording edit (supports criterion 5, observed through the screen).
  fails_when: The warning renders for a validly loaded JSON object.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: an invalid loaded configuration is warned about (criterion 8) > shows the same plain warning once
    a valid loaded configuration is edited into unparsable text, and disables Save while it stays that
    way
  proves: Criterion 4 in full — for unparsable text, the corrected warning renders and Save stays blocked
    (both the disabled attribute and that a click issues no PUT) — tested via an edit from a valid baseline
    so the block is attributable to invalidity, not to mere non-dirtiness.
  fails_when: The corrected text fails to render for unparsable text, or Save's disabled attribute is
    absent, or a click on it issues a PUT.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: an invalid loaded configuration is warned about (criterion 8) > edits away the warning once the
    text is corrected back to valid JSON
  proves: The warning is not sticky — correcting the value clears it, unaffected by the wording change
    (supports criterion 5, observed through the screen).
  fails_when: The corrected warning text keeps rendering after the field is edited back to valid JSON.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: the warning states the object requirement rather than a JSON-syntax claim, for a syntactically
    valid JSON array (corrective criteria 1-4) > does not claim the value is not valid JSON, states it
    must be a JSON object, and blocks Save, once a validly loaded configuration is edited into this shape
  proves: 'Criterion 2 in full: for a syntactically valid array, the warning does not claim invalid JSON
    syntax (explicit absence assertion against the old wording), states the object requirement, and Save
    stays blocked (disabled attribute plus no PUT on click).'
  fails_when: The old 'is not valid JSON' sentence renders for an array, or the corrected sentence is
    absent, or Save is enabled or a click issues a PUT for an array value.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: the warning states the object requirement rather than a JSON-syntax claim, for syntactically valid
    JSON null (corrective criteria 1-4) > does not claim the value is not valid JSON, states it must be
    a JSON object, and blocks Save, once a validly loaded configuration is edited into this shape
  proves: 'Criterion 3 in full: for syntactically valid null, the warning does not claim invalid JSON
    syntax, states the object requirement, and Save stays blocked.'
  fails_when: The old 'is not valid JSON' sentence renders for null, or the corrected sentence is absent,
    or Save is enabled or a click issues a PUT for a null value.
untested:
- Criterion 5 (isValidConfigurationObject and what it gates are unchanged) has no new test written against
  use-connector-configuration-detail.ts or use-connector-configuration-detail-validity.spec.ts, because
  that hook file was not touched by this task's implementation and its own coverage — use-connector-configuration-detail-validity.spec.ts's
  'configurationValid rejects a non-object parsed value' describe blocks, parametrized over NON_OBJECT_CONFIGURATIONS
  (array, bare string, number, true, null) at both load and edit time — already establishes the gate's
  behavior and was left as-is. The screen-level tests above corroborate this at the integration level
  (warning renders and Save blocks for the same shapes through the UI) but do not independently re-prove
  the hook's own internals; the hook-level file is the primary evidence for criterion 5 and was read to
  confirm it is unmodified and still passes over the unchanged three-case classification.
- No edge case beyond the two shapes criteria 2 and 3 name (array, null) was added for isValidConfigurationObject's
  other non-object cases (bare string, number, boolean) — those are already covered at the hook level
  by NON_OBJECT_CONFIGURATIONS and are not named by this corrective task's own criteria, which state exactly
  three failure shapes for the warning (unparsable text, array, null); extending the screen-level warning-text
  proof to every non-object shape the hook happens to reject would assert more than this task's own criteria
  establish.
---

## What it is

The proof for connector-configuration-warning-text: six tests across
connector-configuration-detail-screen.spec.ts proving the corrected warning text and Save-blocking
hold for all three isValid=false shapes, plus two shared fixtures added to the file's own
test-support module.

## Notes

connector-configuration-detail-screen.test-support.ts also gained two shared fixture constants,
ARRAY_CONFIGURATION and NULL_CONFIGURATION, used by the array and null tests above — not itself
a test, so it carries no entry under `tests`.
