---
title: Capability form and detail-view surfaces backing payload_notes
summary: The frontend's shared capability form/detail machinery declares every other optional attribute
  in one Zod schema and one field-rendering component, but payload_notes is absent from all three layers
  it would need to pass through.
sources:
- work/capability-payload-notes-frontend/intake/scope.md
area:
- frontend/app/src/routes/capability-form-fields.tsx
- frontend/app/src/routes/capability-detail-ready-view.tsx
- frontend/app/src/routes/capability-create-screen.tsx
- frontend/app/src/services/capability-form-schema.ts
- frontend/app/src/hooks/use-capabilities.ts
- frontend/app/src/hooks/use-capability-form.ts
- frontend/app/src/hooks/use-capability-detail.ts
- frontend/app/src/hooks/use-capability-detail-view.ts
- frontend/app/src/shared/components/json-textarea-field.tsx
modules:
- name: capability-form-fields
  path: frontend/app/src/routes/capability-form-fields.tsx
  role: touched
- name: capability-form-schema
  path: frontend/app/src/services/capability-form-schema.ts
  role: touched
- name: use-capabilities
  path: frontend/app/src/hooks/use-capabilities.ts
  role: touched
- name: use-capability-form
  path: frontend/app/src/hooks/use-capability-form.ts
  role: touched
- name: use-capability-detail
  path: frontend/app/src/hooks/use-capability-detail.ts
  role: touched
- name: capability-detail-ready-view
  path: frontend/app/src/routes/capability-detail-ready-view.tsx
  role: depends-on
- name: capability-create-screen
  path: frontend/app/src/routes/capability-create-screen.tsx
  role: adjacent
- name: use-capability-detail-view
  path: frontend/app/src/hooks/use-capability-detail-view.ts
  role: adjacent
- name: json-textarea-field
  path: frontend/app/src/shared/components/json-textarea-field.tsx
  role: adjacent
conventions:
- statement: 'An optional scalar attribute (precedent: timeout) is declared .optional() in capability-form-schema.ts,
    rendered as a plain input inside the shared FormField wrapper in capability-form-fields.tsx, read
    from query.data.<attr> / existing?.<attr> in the two hooks, and forwarded by name into both PUT bodies.'
  seen_at: frontend/app/src/services/capability-form-schema.ts, frontend/app/src/routes/capability-form-fields.tsx,
    frontend/app/src/hooks/use-capability-detail.ts, frontend/app/src/hooks/use-capability-form.ts
- statement: capability-detail-ready-view.tsx renders the same always-editable CapabilityFormFields component
    the create screen uses; there is no separate read-only display markup to update for an attribute.
  seen_at: frontend/app/src/routes/capability-detail-ready-view.tsx
must_not_duplicate:
- what: The FormField label/error wrapper every capability attribute field already uses
  at: frontend/app/src/routes/capability-form-fields.tsx
risks:
- risk: json-textarea-field.tsx is schema-specific (JSON beautify/validity), not a plain multi-line textarea,
    so payload_notes needs its own bare Textarea rendering rather than reusing that component as-is.
  consumers:
  - frontend/app/src/routes/capability-form-fields.tsx
---
## What it is

capability-form-fields.tsx is the single rendering component both the create screen and the detail (edit) view compose, so one edit there reaches both surfaces the scope names.
capability-detail-ready-view.tsx wraps capability-form-fields with detail-only chrome (discard/cancel/save-status) and carries no field-level rendering of its own.
capability-create-screen.tsx wires the same capability-form-fields component for registration and shares its state entirely through use-capability-form.
capability-form-schema.ts holds the single Zod object (capabilityFormSchema) that both use-capability-form and use-capability-detail resolve against; every field the form renders is declared here first.
Capability (in use-capabilities.ts) is the read/response type the detail view and the list consume; it declares name, version, nature, input_schema, output_schema, timeout, connector, concept, and has no payload_notes field today.
use-capability-form.ts (create path) and use-capability-detail.ts (edit path) each independently build defaultValues from an existing Capability and independently build the PUT request body from form values.
Backend DTOs already carry the field: src/http/dto/register-capability.dto.ts and src/http/dto/read-capability-by-identity.dto.ts both declare payload_notes as an optional string, so the wire contract is ready and only the frontend type/schema/UI are missing it.
The closest precedent for an optional scalar is timeout: declared optional in the schema, rendered as a plain Input inside the shared FormField wrapper, read from query.data.timeout and existing?.timeout, and forwarded by name in both PUT bodies.
connector is the closest example of a plain required free-text attribute, rendered with a bare Input; no existing capability field renders a plain (non-JSON) multi-line textarea today, so there is no in-file precedent for a bare Textarea beyond the JSON-specific json-textarea-field.tsx.
No frontend file under frontend/app currently mentions payload_notes — the gap is real, not a case where the field already flows through and only needs display markup.

## Notes

None.
