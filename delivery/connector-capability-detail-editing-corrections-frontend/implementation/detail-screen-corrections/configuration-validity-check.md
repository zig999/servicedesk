---
title: Reject non-object JSON in the connector-configuration validity check
summary: use-connector-configuration-detail.ts's configurationValid derivation now requires the parsed value to be a plain object, not merely syntactically valid JSON, at both places within the hook where the flag is set.
task: sha256:8870974af00700fe05f61de0ca734d61519547e27fb75ab53d40b8f12b1f8c25
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/detail-screen-corrections-configuration-validity-check-build-2
files:
- path: src/hooks/use-connector-configuration-detail.ts
  effect: 'Adds a module-level isValidConfigurationObject(text: string): boolean helper that reuses getJsonTextareaMinifiedValue''s own parse (returning false when it returns null), then JSON.parses the already-validated minified string into a variable typed unknown and checks typeof parsed === "object" && parsed !== null && !Array.isArray(parsed). Both places the hook derives configurationValid (the load effect, and the configuration.onChange handler returned on the ready-phase state) now call this helper instead of the old parse-only check. getJsonTextareaMinifiedValue''s own three call sites (isDirty comparison, save-payload minification) and its own definition in json-textarea-field.tsx are unchanged.'
criteria:
- criterion: A configuration text that parses as valid JSON but is not an object (an array, a bare string, a number, true, or null) sets configurationValid to false in use-connector-configuration-detail.ts, where it previously read true.
  met: true
  how: isValidConfigurationObject rejects any parsed value that is not a plain object. Both the load effect and the configuration.onChange handler derive configurationValid from it, so a stored non-object value reads as invalid immediately after load, and typing or pasting a non-object valid-JSON value into the field also reads as invalid the moment it is entered.
- criterion: A configuration text that parses as a JSON object continues to set configurationValid to true.
  met: true
  how: isValidConfigurationObject returns true for any parsed value where typeof is "object", it is not null, and Array.isArray is false — exactly a plain object.
- criterion: The Save button in connector-configuration-form-fields.tsx is disabled when configurationValid is false for a non-object parsed value, with no code change to connector-configuration-form-fields.tsx itself.
  met: true
  how: connector-configuration-form-fields.tsx's isSaveDisabled already reads !configuration.isValid, and configuration.isValid is configurationValid straight through from the hook's returned state — corrected at its source, so this consumer needed no edit. Verified the file is unmodified.
- criterion: The warning banner in connector-configuration-detail-ready-view.tsx appears when configurationValid is false for a non-object parsed value, with no code change to connector-configuration-detail-ready-view.tsx itself.
  met: true
  how: The ready-view's INVALID_CONFIGURATION_WARNING banner is already gated on !configuration.isValid, reading the same corrected flag with no edit to that file. Verified the file is unmodified.
- criterion: use-capability-detail.ts's inputSchemaValid and outputSchemaValid derivation, and json-textarea-field.tsx's parseJsonText/getJsonTextareaMinifiedValue, are unchanged.
  met: true
  how: Neither file was opened for writing; use-capability-detail.ts's own derivation still calls getJsonTextareaMinifiedValue directly with no object check, and parseJsonText/getJsonTextareaMinifiedValue in json-textarea-field.tsx are byte-for-byte as surveyed.
nodes:
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  encoded_at:
  - src/hooks/use-connector-configuration-detail.ts
  how: 'The rule states the registry refuses a configuration that is not syntactically valid JSON object text. This task closes the one place on the frontend that previously let a syntactically valid but non-object value read as acceptable before ever reaching the registry: isValidConfigurationObject now encodes the same object requirement client-side, so the warning banner and the Save-disable this flag feeds catch the case the registry would otherwise have to refuse. The rule''s own home (domain/integration/connector-configuration and the registry''s own refusal) is unchanged; this delivery adds no new domain fact, it corrects an existing UI check to match a requirement the rule already stated.'
inferences:
- inferred: Fixed configurationValid's derivation at both call sites within the hook (the load effect, and the configuration.onChange handler on the returned ready-phase state) rather than only the load effect the task's own hint named as the fix's location.
  from: the task's criteria state the general fact "sets configurationValid to false ... where it previously read true" without qualifying it to load time only, and the task's own objective says the derivation "gates the warning banner and the Save-disable it feeds" — both of which read the live configurationValid value, not only its value immediately after load. JsonTextareaField's own onChange callback reports only a parse-only isValid boolean on every keystroke; before this correction the hook's configuration.onChange set configurationValid straight from that boolean, so an operator typing a non-object valid-JSON value after load would have re-enabled Save and hidden the warning banner even after a load-effect-only fix.
divergences:
- cites: TYP-02
  file: src/hooks/use-connector-configuration-detail.ts
  departure: 'the first draft of isValidConfigurationObject used an `as unknown` type assertion on JSON.parse''s result, which @typescript-eslint/consistent-type-assertions refuses; corrected to a variable annotated `: unknown` instead, narrowing identically without an assertion.'
  why: caught by the captured build run's lint step and fixed before this record was written — disclosed here since the standard's own rule is what the run enforced.
preserved:
- configurationValid remains a useState mirrored by an effect and by the onChange handler, the same pre-existing shape — only what value it is set to was corrected.
- getJsonTextareaMinifiedValue's other two call sites in this same hook (the isDirty comparison, and the save-payload minification) are untouched and still accept any syntactically valid JSON value for those two purposes.
- use-capability-detail.ts's inputSchemaValid/outputSchemaValid, connector-configuration-form-fields.tsx, connector-configuration-detail-ready-view.tsx, and json-textarea-field.tsx's parseJsonText/getJsonTextareaMinifiedValue are all unmodified.
deferred:
- what: use-capability-detail.ts's inputSchemaValid/outputSchemaValid derive through the identical parse-only gap for input_schema/output_schema (the capability-side analogue of this exact bug), and would need the same kind of fix if a corrective task for that surface is ever cut.
  why: explicitly out of this task's scope; the task file names it as a file not to touch.
---

## What it is

use-connector-configuration-detail.ts's configurationValid derivation now rejects a syntactically valid but non-object JSON value, at both the load effect and the live onChange handler.

## Notes

The first build attempt (run/detail-screen-corrections-configuration-validity-check-build) failed lint: an `as unknown` type assertion on JSON.parse's result was refused by @typescript-eslint/consistent-type-assertions. Fixed by annotating the variable `: unknown` instead of asserting it, identical narrowing with no assertion. Second build attempt passed.
