---
title: Capability detail form fields — row and editor-height layout
summary: The capability create/edit form's field markup and the shared JSON textarea control, where the
  two layout changes the scope names land.
area:
- src/routes/capability-form-fields.tsx
- src/shared/components/json-textarea-field.tsx
modules:
- name: capability-form-fields
  path: src/routes/capability-form-fields.tsx
  role: touched
- name: json-textarea-field
  path: src/shared/components/json-textarea-field.tsx
  role: touched
- name: connector-configuration-form-fields
  path: src/routes/connector-configuration-form-fields.tsx
  role: adjacent
- name: connector-test-panel-fields
  path: src/routes/connector-test-panel-fields.tsx
  role: adjacent
conventions:
- statement: A row of fields is a <div className="flex gap-4"> (two fields) or <div className="grid grid-cols-N
    gap-4"> (three or more fields) wrapping sibling FormField elements; FormField itself never carries
    row layout.
  seen_at: src/routes/capability-form-fields.tsx
- statement: Existing tests locate fields by screen.getByLabelText(...), never by DOM position, row grouping
    or class name.
  seen_at: src/routes/capability-detail-screen.spec.ts
- statement: No arbitrary-value Tailwind class (min-h-[...] or similar) exists anywhere in this app's
    or the shared design-system's source today; every height utility used is a stock step (e.g. min-h-40,
    min-h-screen).
  seen_at: src/shared/components/json-textarea-field.tsx
must_not_duplicate:
- what: The single FormField label-wrapping-control component the capability form already defines and
    every field in this file reuses
  at: src/routes/capability-form-fields.tsx
- what: The shared JsonTextareaField control (beautify, inline JSON error, height) used identically by
    both the capability form and the connector-configuration form
  at: src/shared/components/json-textarea-field.tsx
risks:
- risk: JsonTextareaField's Textarea height class is shared verbatim by a second consumer; raising it
    here raises the connector configuration form's editor too, not only the capability screen's.
  consumers:
  - src/routes/connector-configuration-form-fields.tsx
sources:
- work/capability-detail-layout-adjustment/intake/scope.md
---

## What it is

`CapabilityFormFields` (src/routes/capability-form-fields.tsx) renders Name and Version in one `flex gap-4` row (lines 130-148) and Nature in its own separate `FormField` immediately below (lines 150-166), then Input/Output schema in a `grid grid-cols-2 gap-4` row (line 168) using the shared `JsonTextareaField` component (src/shared/components/json-textarea-field.tsx), whose `Textarea` carries `min-h-40` (line 150 of that file).
The same `JsonTextareaField` component is also used by `ConnectorConfigurationFormFields` (src/routes/connector-configuration-form-fields.tsx) for its single `configuration` field, so any class change on the shared component's `Textarea` affects both forms.
Existing coverage of this screen (src/routes/capability-detail-screen.spec.ts) asserts on each field by its accessible label text and never on row grouping, class names or DOM position.

## Notes

No arbitrary Tailwind value class exists anywhere in this codebase today (checked across frontend/app/src and referenced via the design-system's build-scan spec), so the scope's own proposed `min-h-[12.5rem]` would be the first instance of that pattern rather than a repetition of an established one.
Tailwind's compiled-output scan (src/design-system/tailwind-tui-source-scan.build.spec.ts) works from automatic content-detection over this app's own source plus an added `@source` path into the TUI submodule; an arbitrary-value class written directly in this app's own `.tsx` source is picked up by that same automatic detection, the same way every stock class already is.
