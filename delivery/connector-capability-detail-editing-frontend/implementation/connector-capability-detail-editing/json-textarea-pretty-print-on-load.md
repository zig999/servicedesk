---
title: JsonTextareaField pretty-prints a loaded value on mount and on load
summary: JsonTextareaField now reformats a syntactically valid JSON value as indented
  text the moment it is mounted or replaced from outside, leaving typing, Beautify,
  the inline error and the minify-on-save helper untouched.
task: sha256:3dbd0797c7cf8a677a61e774182ca1daa6e8a3093d342b2dc64774c67e25854a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-capability-detail-editing-json-textarea-pretty-print-on-load-build
files:
- path: src/shared/components/json-textarea-field.tsx
  effect: 'Adds a load-normalization effect to JsonTextareaField: on mount, and on
    any value transition the control did not itself produce (a caller replacing the
    loaded record), a syntactically valid value is reformatted through the same JSON.stringify(parsed,
    null, 2) Beautify already uses and reported back through the caller own onChange
    with isValid true. A selfInitiatedRef set inside handleChange and handleBeautify
    tells a self-produced transition apart from an external load so typing and Beautify
    are never reformatted a second time by this new effect. A value that fails to
    parse is left exactly as passed, and the existing parsed-driven aria-invalid,
    aria-describedby and inline Invalid JSON paragraph are unchanged.'
criteria:
- criterion: Given a syntactically valid JSON value, the textarea's displayed text is
    pretty-printed rather than left in the minified form it was passed, immediately
    on mount.
  met: true
  how: The new useEffect in JsonTextareaField always runs on first render (selfInitiatedRef
    starts false), reuses the render body own memoized parsed, and where it parsed
    and the pretty-printed form differs from the text passed in, calls onChange with
    that pretty text and true. React flushes this state update, and the render it
    produces, before an effect-driven update is ever visible to the user.
- criterion: Given a value that is not valid JSON, the textarea shows the value as-is,
    so the existing inline "Invalid JSON" error behavior is unchanged.
  met: true
  how: The load effect returns immediately when parsed.ok is false, so an invalid
    value is never rewritten or passed to onChange from this new code path; the Textarea
    keeps rendering value exactly as given, and the pre-existing aria-invalid, aria-describedby
    and error paragraph are untouched.
- criterion: The configuration field in the connector-configuration create/edit dialog
    shows its loaded value pretty-printed.
  met: true
  how: connector-configuration-form-fields.tsx passes configuration.value straight
    into JsonTextareaField value prop, unmodified, and use-connector-configuration-form.ts
    sets that value at the hook own first call, the same call that produces the dialog
    first render; JsonTextareaField own mount-time pretty-print then applies with
    neither caller file touched.
- criterion: The input_schema and output_schema fields in the capability create/edit
    dialog show their loaded values pretty-printed.
  met: true
  how: 'The same mechanism as criterion 3: capability-form-fields.tsx passes inputSchema.value
    and outputSchema.value straight into two JsonTextareaField instances, set at use-capability-form.ts
    own first call, landing at the fields own first mount; both get the shared control
    mount-time pretty-print with neither caller file touched.'
inferences:
- inferred: A value transition is treated as a load, and pretty-printed when valid,
    whenever it did not originate from this control own handleChange or handleBeautify,
    not only on the component very first render.
  from: The objective states on mount and whenever a new value is loaded into it as
    two distinct cases, and the task own rationale names the two not-yet-built detail
    routes as places this same behavior must hold; neither existing caller in this
    task remounts across a value change today, so covering the second case generically
    was inferred from the objective own wording and from the rationale naming callers
    this task does not reach itself.
preserved:
- The Beautify button exact reformatting output and its disabled-while-invalid state.
- The inline Invalid JSON error paragraph, its role alert, and the aria-invalid/aria-describedby
  wiring on the Textarea.
- getJsonTextareaMinifiedValue minify-on-save behavior, including returning null for
  text that is not syntactically valid JSON.
- A value that is not valid JSON continuing to display exactly as passed, with no
  reformatting attempted on it.
- Text the user is actively typing is never rewritten mid-edit by the new load-normalization
  effect, distinguished from a load by selfInitiatedRef.
- connector-configuration-form-fields.tsx and capability-form-fields.tsx passing each
  field value/onChange straight through to JsonTextareaField, unmodified by this task.
---

## What it is

JsonTextareaField now reformats a syntactically valid loaded value to its pretty-printed form on mount and whenever a caller replaces the value from outside, distinguishing a load from the user own typing or Beautify click via a ref flag.
No caller file was touched; both existing dialogs get the behavior because they already pass their loaded value straight into this shared component.

## Notes

This task implements no specification node -- it is a purely presentational change to how a shared component renders a value it already holds, and the task own rationale/Notes already state why (no candidate specification node speaks to client-side JSON rendering).
The pre-existing test json-textarea-field.spec.ts own operates-independently-across-two-field-instances assertion (expecting exactly one onChange call after a later keystroke) will need revision for this task proof: mounting an already-valid-but-not-pretty value now triggers one extra onChange call to normalize it on load, a direct and correct consequence of criterion 1.
