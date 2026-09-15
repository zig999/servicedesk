---
title: Capability Schema Helper — frontend survey
summary: The Configuration Helper (connector configuration's own OpenAPI-based draft/apply/stale flow) and the capability authoring surface (CapabilityFormFields, used by both the create and detail screens) both live under frontend/app/src and share the same fetch/error/dirty-tracking machinery.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/capability-schema-helper-frontend/intake/scope.md
area:
- frontend/app/src
- frontend/app/src/routes
- frontend/app/src/hooks
- frontend/app/src/services
- frontend/app/src/shared/components
modules:
- name: capability-form-fields
  path: frontend/app/src/routes/capability-form-fields.tsx
  role: touched
- name: use-capability-form
  path: frontend/app/src/hooks/use-capability-form.ts
  role: touched
- name: use-capability-detail-view
  path: frontend/app/src/hooks/use-capability-detail-view.ts
  role: touched
- name: capability-create-screen
  path: frontend/app/src/routes/capability-create-screen.tsx
  role: touched
- name: capability-detail-ready-view
  path: frontend/app/src/routes/capability-detail-ready-view.tsx
  role: touched
- name: connector-configuration-helper
  path: frontend/app/src/routes/connector-configuration-helper.tsx
  role: depends-on
- name: use-connector-configuration-helper
  path: frontend/app/src/hooks/use-connector-configuration-helper.ts
  role: depends-on
- name: use-draft-connector-configuration-from-openapi
  path: frontend/app/src/hooks/use-draft-connector-configuration-from-openapi.ts
  role: depends-on
- name: use-openapi-document-operations
  path: frontend/app/src/hooks/use-openapi-document-operations.ts
  role: depends-on
- name: connector-configuration-helper-fields
  path: frontend/app/src/routes/connector-configuration-helper-fields.tsx
  role: depends-on
- name: connector-configuration-draft-disclosure
  path: frontend/app/src/services/connector-configuration-draft-disclosure.ts
  role: depends-on
- name: connector-configuration-form-fields
  path: frontend/app/src/routes/connector-configuration-form-fields.tsx
  role: depends-on
- name: connector-configuration-apply-diff
  path: frontend/app/src/services/connector-configuration-apply-diff.ts
  role: adjacent
- name: connector-configuration-messages
  path: frontend/app/src/services/connector-configuration-messages.ts
  role: adjacent
- name: api-client
  path: frontend/app/src/services/api-client.ts
  role: depends-on
- name: error-ui-state
  path: frontend/app/src/services/error-ui-state.ts
  role: adjacent
- name: json-textarea-field
  path: frontend/app/src/shared/components/json-textarea-field.tsx
  role: depends-on
conventions:
- statement: A helper is built as hook + fields component + disclosure service, not as one file -- a hook owns request/local state (use-connector-configuration-helper.ts), a fields component renders it (connector-configuration-helper-fields.tsx), and a service translates the request outcome into a UI-facing disclosure union (connector-configuration-draft-disclosure.ts).
  seen_at: frontend/app/src/hooks/use-connector-configuration-helper.ts
- statement: A draft-request hook models its request as a discriminated outcome union (idle/pending/drafted/<refusal-kind>.../unrecognized-failure) derived from a single useMutation via a status-switch function, and exposes statedFor (the request the current draft was generated for) alongside the outcome.
  seen_at: frontend/app/src/hooks/use-draft-connector-configuration-from-openapi.ts
- statement: A mutation-dispatching hook guards against a second dispatch while one is in flight with a useRef boolean, reset in onSettled/finally.
  seen_at: frontend/app/src/hooks/use-draft-connector-configuration-from-openapi.ts
- statement: Staleness is computed, not stored -- a small pure function compares the outcome's statedFor fields against the current field values and returns true only once any of them has changed since the last successful draft.
  seen_at: frontend/app/src/hooks/use-connector-configuration-helper.ts
- statement: Applying a draft never writes to a submitted/persisted value -- it calls the same onChange(value, isValid) the field's own typing uses, and when there is already an unsaved edit it routes through a confirm-overwrite dialog instead of applying immediately.
  seen_at: frontend/app/src/routes/connector-configuration-form-fields.tsx
- statement: A refusal is rendered inline, inside an aria-live="polite" region, as role="alert" text produced by a message function keyed on the ApiError's own code (via a switch), not by the generic error-ui-state.ts table.
  seen_at: frontend/app/src/routes/connector-configuration-helper-fields.tsx
- statement: Every request goes through the single apiFetch(url, init) helper, which throws ApiError{code, message, details} parsed from the uniform {error:{code,message,details}} envelope; no module constructs its own fetch or parses a response body directly.
  seen_at: frontend/app/src/services/api-client.ts
- statement: input_schema and output_schema are held as raw JSON text with a paired isValid flag (JsonSchemaFieldState), rendered through the one shared JsonTextareaField, and minified only at submit time via getJsonTextareaMinifiedValue.
  seen_at: frontend/app/src/routes/capability-form-fields.tsx
- statement: The capability detail screen tracks a dirty baseline via a ref snapshot taken whenever isDirty becomes false, and Discard resets the form and both schema fields to that snapshot.
  seen_at: frontend/app/src/hooks/use-capability-detail-view.ts
- statement: CapabilityFormFields is the one component both the create screen and the detail screen render; anything added inside it (or immediately beside it) reaches both routes at once.
  seen_at: frontend/app/src/routes/capability-create-screen.tsx
must_not_duplicate:
- what: apiFetch + ApiError envelope parsing -- the one fetch/error-envelope helper in the codebase.
  at: frontend/app/src/services/api-client.ts
- what: The draft-request outcome-union + statedFor/staleness pattern (useMutation -> outcomeFromMutation switch, isDispatchingRef in-flight guard, draftIsStale comparison).
  at: frontend/app/src/hooks/use-draft-connector-configuration-from-openapi.ts and frontend/app/src/hooks/use-connector-configuration-helper.ts
- what: useOpenApiDocumentOperations -- already connector-agnostic (takes only a link) and directly reusable for the Schema Helper's own operation picker.
  at: frontend/app/src/hooks/use-openapi-document-operations.ts
- what: getJsonTextareaMinifiedValue and JsonTextareaField's (value, isValid) contract for any drafted schema written into input_schema/output_schema.
  at: frontend/app/src/shared/components/json-textarea-field.tsx
- what: The apply-over-unsaved-edit confirmation dialog and its diff computation, if the plan decides the Schema Helper also needs a confirm-before-overwrite step.
  at: frontend/app/src/routes/connector-configuration-form-fields.tsx and frontend/app/src/services/connector-configuration-apply-diff.ts
- what: The refusal-message-by-ApiError-code switch pattern (not error-ui-state.ts's generic table) for the three OpenAPI refusal codes this operation shares with the Configuration Helper.
  at: frontend/app/src/services/connector-configuration-draft-disclosure.ts
risks:
- risk: OpenApiDocumentFetchFailure and other OpenAPI-reading types are declared inside a connector-configuration-named hook file and imported by use-openapi-document-operations.ts; reusing them for the Schema Helper couples its types to connector-configuration's own naming, so a future rename or split there ripples into the new helper.
  consumers:
  - frontend/app/src/hooks/use-openapi-document-operations.ts
  - frontend/app/src/hooks/use-connector-configuration-helper.ts
- risk: CapabilityFormFields' isSaveDisabled and the detail screen's dirty/baseline tracking already have specific behavior around inputSchema/outputSchema.onChange; wiring a helper's Apply into the same onChange without matching the existing (value, isValid) contract would desynchronize save-gating or Discard from what these already assert.
  consumers:
  - frontend/app/src/hooks/use-capability-detail-view.ts
  - frontend/app/src/routes/capability-detail-screen-save.spec.ts
  - frontend/app/src/routes/capability-detail-screen-invalid-schema.spec.ts
- risk: The capability save mutation always minifies inputSchema/outputSchema text via getJsonTextareaMinifiedValue before PUT; a Schema Helper that writes drafted JSON straight into the field's value without going through the same onChange path would diverge from the payload and validity gating these already assert.
  consumers:
  - frontend/app/src/hooks/use-capability-form.ts
  - frontend/app/src/routes/capability-form-fields.tsx
  - frontend/app/src/routes/capability-detail-ready-view.tsx
- risk: CapabilityFormFields is shared by both the create screen and the detail screen; adding the Schema Helper there (mirroring where ConnectorConfigurationHelper sits) changes both surfaces at once, so both screens' own spec suites observe the change together.
  consumers:
  - frontend/app/src/routes/capability-create-screen.spec.ts
  - frontend/app/src/routes/capability-detail-screen-save.spec.ts
  - frontend/app/src/routes/capability-detail-screen-invalid-schema.spec.ts
---

## What it is

The Configuration Helper's own screen/hook/service split under frontend/app/src, and the capability authoring form (CapabilityFormFields, shared by the create and detail screens) where the new Capability Schema Helper is added, together with the shared fetch/error/dirty-tracking machinery both already depend on.
The already-delivered backend operation is POST /v1/draft-capability-schema-from-openapi, body { link, path, method }, answering 200 { input_schema, output_schema, unresolved: [{ name, reason }] } or refusing under 422 (OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError, OpenApiOperationNotFoundError) or 500.

## Notes

None.
