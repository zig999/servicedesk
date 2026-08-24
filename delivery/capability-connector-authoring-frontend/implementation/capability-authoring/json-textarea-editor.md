---
title: Shared JSON beautify/minify textarea control
summary: Adds a self-contained, reusable JSON-aware textarea field component that beautifies on demand,
  reports validity with every change, and exposes a pure minify function for submission.
task: sha256:9154f757aeb6c4e87e80b7cfb17c20cf05c137309df5dbe564f4a00e9b91deef
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/capability-authoring-json-textarea-editor-build
files:
- path: src/shared/components/json-textarea-field.tsx
  effect: New file. Exports JsonTextareaField (a labeled @tui/ui/textarea with a Beautify button and an
    inline error paragraph), its JsonTextareaFieldProps type (id, label, value, onChange(value, isValid),
    disabled?), and the pure function getJsonTextareaMinifiedValue(value) used at submission time regardless
    of how the text is currently displayed. Internal parsing goes through a private discriminated JsonParseResult
    union and a parseJsonText helper shared by change handling, beautify and minify.
criteria:
- criterion: A "Beautify" control reformats the control's current text as indented, pretty-printed JSON
    without changing what the text means as data.
  met: true
  how: The Beautify button's handleBeautify calls onChange(JSON.stringify(parsed.value, null, 2), true)
    where parsed.value is the already-parsed current text, re-serialized with two-space indentation, so
    the data it represents does not change; the button is disabled while the current text does not parse.
- criterion: Entering syntactically invalid JSON shows an inline error message next to the control.
  met: true
  how: parsed is recomputed from value on every render via useMemo; while !parsed.ok, an error paragraph
    renders directly under the textarea, and the textarea carries aria-invalid and aria-describedby linking
    the two.
- criterion: While the control's current text is invalid JSON, the value it reports upward is marked invalid
    rather than silently passed on as if it were acceptable.
  met: true
  how: 'onChange''s signature is (value: string, isValid: boolean) => void, and every call site (handleChange,
    handleBeautify) reports the text and its validity together in one call, computed fresh each time.'
- criterion: The value the control hands to its caller for submission is the same JSON minified — whitespace,
    tabs and other insignificant characters stripped — regardless of how the text is currently displayed.
  met: true
  how: 'getJsonTextareaMinifiedValue(value) is exported standalone: it parses value and returns JSON.stringify(parsed.value)
    with no formatting arguments, or null if value does not parse — independent of whether the textarea
    is currently showing beautified or raw text.'
- criterion: The control's props (value, onChange, validity) are the same for every field that embeds
    it, so a second and third consumer wire it without re-implementing its parsing or formatting.
  met: true
  how: One exported JsonTextareaFieldProps type (id, label, value, onChange, disabled?) is the entire
    public surface; all parsing, formatting and minifying are internal or separately exported functions
    a consumer calls rather than reimplements.
nodes:
- node: rules/integration/a-capability-declares-well-formed-schemas
  encoded_at:
  - src/shared/components/json-textarea-field.tsx
  how: 'This task builds the reusable control the rule''s own enforcement needs at the point of authoring,
    not the enforcement itself: any screen that embeds JsonTextareaField for a capability''s input or
    output schema receives isValid on every change and can refuse to submit while it is false, and at
    submit time reads getJsonTextareaMinifiedValue rather than trusting the currently displayed text is
    well-formed. Wiring this control into the actual capability-schema fields is the two named sibling
    consumer tasks'' own work, not this one''s.'
inferences:
- inferred: onChange reports (value, isValid) as two positional arguments in one call, rather than two
    independent callbacks.
  from: Criterion 3's wording reads as one reported fact, not two that could be called out of step with
    each other; bundling them in a single call is what makes that guarantee structural rather than a convention
    two separate props would rely on callers to uphold.
- inferred: getJsonTextareaMinifiedValue is a plain exported function beside the component, not an imperative
    handle reached through a ref prop.
  from: Every consumer already holds the control's current text as its own controlled value state, so
    nothing is trapped inside the component that a ref would be needed to reach back out.
- inferred: 'The inline error text is composed as "Invalid JSON: " plus the native JSON.parse error message,
    rather than a fixed business-authored sentence.'
  from: No specification node states copy for a syntax-level parse failure; this is a technical parse
    diagnostic, not a business outcome, so the engine's own message is used rather than an invented business
    sentence.
- inferred: The Beautify button is disabled whenever the current text does not parse.
  from: No criterion or node states behavior for beautifying invalid text; JSON.parse would throw, so
    disabling the control while there is nothing valid to reformat is the only defensible behavior absent
    a stated one.
- inferred: No touched/pristine tracking gates the inline error message — it shows for any invalid text,
    including a freshly empty field.
  from: Neither the task nor the rule node distinguishes a not-yet-edited empty field from any other invalid
    text; the criterion's literal wording is applied uniformly instead.
- inferred: The Beautify button uses variant="secondary" and the catalog's default size.
  from: No existing Button call site in this app names an explicit size prop, so the default size is the
    observed convention; secondary distinguishes it from the primary submit action a form embedding this
    control will also show.
deferred:
- what: Wiring JsonTextareaField into the capability input/output schema fields, the connector configuration
    field, and the test-connector sample input panel.
  why: Named explicitly in this task's own rationale as the work of three separate consumers across two
    other tasks — this task's objective is the control existing independent of any screen, not embedding
    it into one.
---

## What it is

One shared textarea control — pretty-print on demand, inline error on invalid JSON, minified value on submit — that the capability, connector-configuration and test-connector editors will each embed rather than reimplement.

## Notes

None.
