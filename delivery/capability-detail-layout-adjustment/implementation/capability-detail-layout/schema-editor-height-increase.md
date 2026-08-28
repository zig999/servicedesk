---
title: Scope the schema-editor height increase to the capability screen via an opt-in JsonTextareaField
  prop
summary: JsonTextareaField grows a `tall` prop that raises its Textarea's minimum height from 10rem/160px
  to 12.5rem/200px only when set; the capability form's input-schema and output-schema fields pass it,
  and every other consumer (connector-configuration form, connector test panel) is left untouched and
  keeps the 160px default.
task: sha256:d1977708d19ba9490d1b6d41de335fd2efd3b5d95297e8eeda2e9c42e5bedc6f
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/capability-detail-layout-schema-editor-height-increase-build
files:
- path: src/shared/components/json-textarea-field.tsx
  effect: adds an optional `tall` prop to JsonTextareaFieldProps and JsonTextareaField; the Textarea's
    className is now composed with cn() (imported from @tui/lib/cn) as min-h-[12.5rem] when tall is true
    and min-h-40 otherwise, font-mono unchanged either way. Left unset, the component renders exactly
    as before.
- path: src/routes/capability-form-fields.tsx
  effect: the input_schema and output_schema JsonTextareaField call sites now pass tall, so those two
    editors render at 12.5rem/200px minimum height; the header comment gains a note explaining the prop
    and naming the connector-configuration form as the sibling consumer that stays untouched.
criteria:
- criterion: The Textarea rendered by JsonTextareaField for the capability form's input-schema field has
    a minimum height of exactly 200px (12.5rem).
  met: true
  how: capability-form-fields.tsx's input_schema JsonTextareaField now passes tall, which resolves the
    Textarea's className to min-h-[12.5rem] in json-textarea-field.tsx.
- criterion: The Textarea rendered by JsonTextareaField for the capability form's output-schema field
    has a minimum height of exactly 200px (12.5rem).
  met: true
  how: Same mechanism, on the output_schema call site.
- criterion: The Textarea rendered by JsonTextareaField for the connector-configuration form's configuration
    field keeps a minimum height of 160px (10rem), unchanged from today.
  met: true
  how: connector-configuration-form-fields.tsx's single JsonTextareaField call site (the configuration
    field) was not modified and passes no tall prop, so it resolves to the unchanged min-h-40 branch.
- criterion: JsonTextareaField's default rendered height, used by any consumer that does not explicitly
    opt into the taller variant, remains 160px (10rem).
  met: true
  how: tall is optional and its className branch defaults to min-h-40 (the same class the component carried
    before this change) whenever the prop is absent or false -- including connector-test-panel-fields.tsx's
    sample-input field, the third consumer, which was not touched and passes no such prop.
inferences:
- inferred: the opt-in mechanism is a boolean prop named tall on JsonTextareaField, and the taller height
    is written as the Tailwind arbitrary-value class min-h-[12.5rem].
  from: the task's own rationale and the epic's scope.md name a prop-based opt-in and min-h-[12.5rem]
    explicitly as the mechanism ("or an equivalent yielding exactly 200px, whichever this project's own
    Tailwind conventions prefer"); the inventory's own convention note records that no arbitrary-value
    Tailwind class exists anywhere in this codebase today, which is why this is the first instance of
    that pattern rather than a repetition of an established one, and the inventory's build-scan note confirms
    Tailwind's own compiled-output scan picks up an arbitrary-value class written directly in this app's
    source the same way it already picks up every stock class.
- inferred: class composition for the conditional height goes through cn() (from @tui/lib/cn), rather
    than a plain template string or ternary concatenation.
  from: src/shared/components/status-table.tsx's existing use of cn() from the same import path to compose
    a conditional class onto a design-system control's className, which this change follows rather than
    introducing a second convention for conditional Tailwind classes in this codebase.
preserved:
- Every existing json-textarea-field.spec.ts test (Beautify reformatting, inline error display and aria
  wiring, mount-time pretty-print-on-load behavior, per-instance independence) -- none of them assert
  on className or height, and the prop is optional, so the component's behavior for every caller not passing
  tall is unchanged.
- connector-configuration-form-fields.tsx's and connector-test-panel-fields.tsx's own JsonTextareaField
  call sites, and every prop each already passes -- neither file was opened for edit, and each keeps rendering
  at JsonTextareaField's 160px default.
- capability-detail-screen.spec.ts's existing field lookups by accessible label text, which this change
  does not affect (no label, id, or accessible name changed).
---

## What it is

One task of the capability-detail-layout-adjustment epic: a purely presentational height increase
scoped to one consumer of a shared component, through an opt-in prop. Implements no specification
node, per the task's own rationale (confirmed independently by two execution-contract-binder reads).

## Notes

None.
