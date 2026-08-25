---
title: configurationValid rejects a non-object JSON value, both on load and on edit
summary: New tests over use-connector-configuration-detail.ts prove configurationValid now reads false for every syntactically valid JSON shape that is not an object (array, bare string, number, true, null), at both the moment a record loads and the moment the operator edits the field, and continues to read true for a genuine object at both moments — with the Save-disable and warning-banner reactions to that flag, and the three untouched units, confirmed by reading rather than by new tests.
implementation: sha256:15e6ee7607075136cfc1c9864be48322ec5018fe3663a95a68111035134f698b
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/detail-screen-corrections-configuration-validity-check-suite
tests:
- file: src/hooks/use-connector-configuration-detail-validity.spec.ts
  name: useConnectorConfigurationDetail — configurationValid rejects a non-object parsed value right after load (criterion 1) > reads configuration.isValid as false when the loaded configuration parses as $label rather than an object (array, bare string, number, true, null — 5 parameterized cases)
  proves: Task criterion 1, load-time half — a loaded configuration text that parses as valid JSON but is not an object sets configurationValid to false, where it previously read true.
  fails_when: isValidConfigurationObject's object check is removed or weakened so that any of the five non-object shapes reads as valid after load (a regression to the old getJsonTextareaMinifiedValue(...) !== null check).
- file: src/hooks/use-connector-configuration-detail-validity.spec.ts
  name: useConnectorConfigurationDetail — configurationValid continues to read true for an object right after load (criterion 2) > reads configuration.isValid as true when the loaded configuration parses as a JSON object
  proves: Task criterion 2, load-time half — a loaded configuration text that parses as a JSON object continues to set configurationValid to true.
  fails_when: the object check incorrectly rejects a genuine JSON object at load.
- file: src/hooks/use-connector-configuration-detail-validity.spec.ts
  name: useConnectorConfigurationDetail — configurationValid rejects a non-object parsed value once the operator edits the field (criterion 1) > reads configuration.isValid as false once the field is edited to $label rather than an object (5 parameterized cases)
  proves: Task criterion 1, edit-time half — the same object requirement is enforced by the ready-phase configuration.onChange handler, not only by the load effect, so an operator typing a non-object value sees it flagged invalid too.
  fails_when: onChange still derives configurationValid through the old parse-only check, so an edited non-object value reads as valid.
- file: src/hooks/use-connector-configuration-detail-validity.spec.ts
  name: useConnectorConfigurationDetail — configurationValid continues to read true for an object once the operator edits the field (criterion 2) > reads configuration.isValid as true once the field is edited to a different JSON object
  proves: Task criterion 2, edit-time half — editing to a different genuine JSON object continues to read true.
  fails_when: the onChange-side object check incorrectly rejects a genuine JSON object.
- file: src/hooks/use-connector-configuration-detail-validity.spec.ts
  name: useConnectorConfigurationDetail — configurationValid continues to read true for an object once the operator edits the field (criterion 2) > recovers configuration.isValid to true once a non-object edit is corrected back to a JSON object
  proves: The flag is a live derivation from the current text on every edit, not a one-shot or sticky flag.
  fails_when: configurationValid is derived only once, cached, or otherwise fails to re-evaluate to true once the text is corrected back to a valid object.
not_applicable:
- edge_case: Empty configuration text, and other malformed (non-parseable) JSON
  why: isValidConfigurationObject's own first branch (getJsonTextareaMinifiedValue returning null) is untouched pre-existing behavior this task's own scope does not change — already covered end-to-end by connector-configuration-detail-screen.spec.ts's own criterion-8 tests, and not the failure this task corrects, which is specifically a value that does parse but is the wrong shape.
- edge_case: An empty object ({}) as a boundary of the object check
  why: not named by the task's own criterion 1 representative set, and typeof {} === "object" with !Array.isArray({}) follows the exact same code path as the non-empty objects already exercised by LOADED_CONFIGURATION/UPDATED_CONFIGURATION — no separate branch exists for it to exercise.
- edge_case: Concurrent edits / a dependency that fails or answers slowly
  why: this correction is a pure, synchronous derivation over the current text with no new async or concurrency surface; the existing load-error and retry coverage in use-connector-configuration-detail.spec.ts is untouched and still applies.
untested:
- 'Task criteria 3 and 4 (Save-disable in connector-configuration-form-fields.tsx and the warning banner in connector-configuration-detail-ready-view.tsx reacting to configurationValid for a non-object parsed value specifically) are not proven end-to-end with a non-object fixture at the screen level. Confirmed by reading: both components read only the boolean configuration.isValid, with no branch on why the flag is false, and neither file changed. connector-configuration-detail-screen.spec.ts''s own criterion-8 tests already exercise that same boolean-reactive mechanism end-to-end, but only with a malformed-JSON (unparseable) fixture, never with a valid-but-non-object fixture. The composition of that existing coverage with this delivery''s new hook-level tests establishes criteria 3 and 4 by inference rather than by a single test that would fail if the composition itself were wrong.'
---

## What it is

New parameterized tests over use-connector-configuration-detail.ts proving configurationValid's object requirement holds both at load and on every edit, for five representative non-object JSON shapes, plus recovery back to true once corrected.
Criteria 3 and 4 (the Save-disable and warning-banner reactions) are established by reading the two unchanged consumer files plus this project's own existing screen-level coverage, disclosed under untested rather than reproven with a new fixture.

## Notes

None.
