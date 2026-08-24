---
title: Proof for the shared JSON beautify/minify textarea control
summary: Thirteen tests against JsonTextareaField and getJsonTextareaMinifiedValue, proving all five stated
  criteria plus the implementation's own disclosed inferences.
implementation: sha256:c8174b220f678c876f6118f36419695ad528c4d2b4d146f8c3349196f9339350
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/capability-authoring-json-textarea-editor-suite-2
tests:
- file: src/shared/components/json-textarea-field.spec.ts
  name: reformats compact JSON as two-space indented, pretty-printed JSON without changing what it means
    as data (Beautify)
  proves: A "Beautify" control reformats the control's current text as indented, pretty-printed JSON without
    changing what the text means as data.
  fails_when: 'handleBeautify does not call onChange with exactly the two-space-indented string, drops/reorders
    data, or reports isValid: false'
- file: src/shared/components/json-textarea-field.spec.ts
  name: disables the Beautify control while the current text does not parse as JSON
  proves: the implementation's own disclosed inference that Beautify is disabled when there is nothing
    valid to reformat
  fails_when: the button's disabled attribute is not true for malformed input, or onChange fires anyway
    on click
- file: src/shared/components/json-textarea-field.spec.ts
  name: shows an inline error message linked to the control via aria-invalid/aria-describedby
  proves: Entering syntactically invalid JSON shows an inline error message next to the control.
  fails_when: no role="alert" element renders, the text omits "Invalid JSON", aria-invalid isn't "true",
    or aria-describedby doesn't match the alert's id
- file: src/shared/components/json-textarea-field.spec.ts
  name: shows no inline error message while the current text is valid JSON
  proves: the negative side of the inline-error criterion, plus that validity is reflected accurately
    rather than defaulting to an error state
  fails_when: an alert renders for valid text, or aria-invalid isn't "false"
- file: src/shared/components/json-textarea-field.spec.ts
  name: shows the inline error message for a freshly empty field, with no untouched grace period
  proves: the implementation's own disclosed inference that no touched/pristine gating exists
  fails_when: the component withholds the error on first render with empty value
- file: src/shared/components/json-textarea-field.spec.ts
  name: carries the JSON parser's own diagnostic message rather than a fixed sentence
  proves: the implementation's own disclosed inference that the native JSON.parse message is used
  fails_when: two different malformed inputs produce identical messages, or either omits the "Invalid
    JSON:" prefix
- file: src/shared/components/json-textarea-field.spec.ts
  name: reports newly typed text together with true when it parses as valid JSON
  proves: criterion 3's positive case and the single-call (value, isValid) inference
  fails_when: onChange isn't called, is called with false, or with a mutated value instead of the raw
    typed text
- file: src/shared/components/json-textarea-field.spec.ts
  name: marks the newly typed text invalid rather than silently passed on, when it does not parse as JSON
  proves: While the control's current text is invalid JSON, the value it reports upward is marked invalid
    rather than silently passed on as if it were acceptable.
  fails_when: onChange reports true for malformed text, or substitutes a different value
- file: src/shared/components/json-textarea-field.spec.ts
  name: operates independently across two field instances sharing the same props shape
  proves: The control's props (value, onChange, validity) are the same for every field that embeds it,
    so a second and third consumer wire it without re-implementing its parsing or formatting.
  fails_when: state leaked between instances, editing one instance calls the other's onChange, or the
    alert count doesn't match exactly the one instance with invalid text
- file: src/shared/components/json-textarea-field.spec.ts
  name: strips insignificant whitespace from indented, pretty-printed text
  proves: The value the control hands to its caller for submission is the same JSON minified — whitespace,
    tabs and other insignificant characters stripped — regardless of how the text is currently displayed.
  fails_when: the returned string retains any whitespace/newline, or parsing throws
- file: src/shared/components/json-textarea-field.spec.ts
  name: returns the same minified string for the same data whether the source text is compact or pretty-printed
  proves: the "regardless of how the text is currently displayed" clause of the minify criterion
  fails_when: compact and pretty-printed forms of the same data minify to different strings
- file: src/shared/components/json-textarea-field.spec.ts
  name: returns null for text that is not syntactically valid JSON
  proves: the minify function's stated boundary behavior for invalid input
  fails_when: it throws instead of returning null, or returns the raw invalid string unchanged
- file: src/shared/components/json-textarea-field.spec.ts
  name: returns null for an empty string, rather than treating absent text as valid JSON
  proves: a distinct edge case at the field's natural initial state
  fails_when: it returns "", confuses null with the string "null", or throws uncaught
not_applicable:
- edge_case: tabs specifically as insignificant whitespace
  why: minification runs through JSON.stringify with no formatting arguments, which by construction emits
    no whitespace of any kind regardless of the source's use of tabs vs. spaces — a low-risk gap given
    the mechanism, though nothing here directly exercises a literal tab character
- edge_case: whitespace-only or leading/trailing-whitespace input to getJsonTextareaMinifiedValue
  why: JSON.parse tolerates surrounding whitespace structurally and no criterion distinguishes this from
    ordinary valid/invalid text
- edge_case: Beautify clicked on already-beautified (idempotent) text
  why: this follows from the same code path already proven by the compact-to-pretty test, and criterion
    1 does not name idempotency as a distinct behavior
untested:
- the disabled prop's effect on the rendered control (not exercised anywhere in this file) — declared
  in JsonTextareaFieldProps per the implementation record, but no criterion states its behavior
- the Beautify button's variant="secondary"/default-size styling choices — presentational, not behavioral,
  so their absence from a behavioral spec file is appropriate rather than a gap
---

## What it is

Thirteen tests proving JsonTextareaField's five stated criteria — beautify, inline error, validity marking, minified submission value, and a uniform props shape across instances — plus the implementation's own disclosed inferences.

## Notes

None.
