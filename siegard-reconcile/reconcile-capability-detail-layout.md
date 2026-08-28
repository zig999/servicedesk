---
contract_version: siegard-reconcile/1
title: capability-detail-layout rebind after the capability-detail-layout-adjustment delivery
summary: The capability-detail-layout-adjustment initiative (two tasks implementing no specification node)
  regrouped Name/Version/Nature into one row and added an opt-in `tall` prop to JsonTextareaField for
  the two schema editors; that delivery bound no node (it implements none), leaving the pre-existing bindings
  on both touched files stale.
target: frontend
files:
- path: src/routes/capability-form-fields.tsx
  change: Name, Version and Nature now render inside one grid grid-cols-3 gap-4 row instead of Nature
    sitting in its own row below; the input_schema and output_schema JsonTextareaField call sites now
    pass a tall prop. No field's values, options, validation or label wiring changed.
- path: src/shared/components/json-textarea-field.tsx
  change: gained an optional tall prop that switches the rendered Textarea's minimum-height class between
    min-h-40 (default, unchanged) and min-h-[12.5rem]; no other behavior changed.
nodes:
- node: domain/integration/capability
  conforms: true
  how: capability-form-fields.tsx still declares name, version, nature, input_schema, output_schema, timeout,
    connector and concept as the form's own fields (lines 12-18, 136-232); only their row arrangement
    changed.
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: domain/integration/capability-nature
  conforms: true
  how: NATURE_OPTIONS (lines 76-79) still maps CAPABILITY_NATURES unchanged; only its position in the
    row moved.
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: true
  how: 'In capability-form-fields.tsx, isSaveDisabled (lines 130-131) still gates on inputSchema.isValid/outputSchema.isValid,
    unchanged by the row regrouping or the tall prop pass-through (lines 174-190). In json-textarea-field.tsx,
    the file implements only a client-side syntactic-JSON check (parseJsonText/JSON.parse) and states
    no HTTP status or error-class name for this node either before or after the delivery; the added tall
    prop only switches the rendered min-height class (cn(tall ? "min-h-[12.5rem]" : "min-h-40", "font-mono"))
    and bears on none of this node''s facts.'
  encoded_at:
  - src/routes/capability-form-fields.tsx
  - src/shared/components/json-textarea-field.tsx
- node: rules/integration/a-capability-is-read-only
  conforms: true
  how: the file still only offers both nature values through the same NATURE_OPTIONS list; it encodes
    no enforced refusal either before or after this delivery, and the row regrouping does not change that.
  encoded_at:
  - src/routes/capability-form-fields.tsx
- node: rules/integration/one-capability-answers-one-concept
  conforms: true
  how: the concept field (lines 40-44, 216-231) is still a single-select Select, never a multi-select,
    unchanged by this delivery.
  encoded_at:
  - src/routes/capability-form-fields.tsx
notes: Two delegations ran, one per file. rules/integration/a-capability-declares-well-formed-schemas
  is bound to both files; its entry folds both delegations' readings, and both cleared it.
---
